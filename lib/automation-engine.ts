import { chromium, Browser, Page } from 'playwright'
import { promises as fs } from 'fs'
import path from 'path'
import LeadHoopService, { LeadData, LeadHoopConfig } from './leadhoop'

export interface AutomationResult {
  success: boolean
  processingTimeMs: number
  screenshotPath?: string
  errorMessage?: string
  responseData?: any
  portalResponseCode?: number
  portalResponseMessage?: string
}

export class AutomationEngine {
  private browser: Browser | null = null
  private screenshotDir: string

  constructor() {
    this.screenshotDir = path.join(process.cwd(), 'automation-screenshots')
    this.ensureScreenshotDir()
  }

  /**
   * Ensure screenshot directory exists
   */
  private async ensureScreenshotDir() {
    try {
      await fs.mkdir(this.screenshotDir, { recursive: true })
    } catch (error) {
      console.warn('Could not create screenshot directory:', error)
    }
  }

  /**
   * Initialize browser
   */
  async initBrowser(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      })
    } catch (error) {
      console.error('Failed to launch browser:', error)
      throw new Error(`Browser initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Close browser
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  /**
   * Generate screenshot filename
   */
  private generateScreenshotPath(leadId: string, timestamp: string, suffix: string = ''): string {
    const filename = `lead_${leadId}_${timestamp}${suffix}.png`
    return path.join(this.screenshotDir, filename)
  }

  /**
   * Take screenshot with error handling
   */
  private async takeScreenshot(page: Page, leadId: string, suffix: string = ''): Promise<string | undefined> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const screenshotPath = this.generateScreenshotPath(leadId, timestamp, suffix)
      
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      })
      
      return screenshotPath
    } catch (error) {
      console.error('Failed to take screenshot:', error)
      return undefined
    }
  }

  /**
   * Submit lead to LeadHoop portal
   */
  async submitToLeadHoop(
    leadData: LeadData,
    config: LeadHoopConfig,
    constructedUrl: string
  ): Promise<AutomationResult> {
    const startTime = Date.now()
    let page: Page | null = null
    let screenshotPath: string | undefined

    try {
      // Ensure browser is initialized
      if (!this.browser) {
        await this.initBrowser()
      }

      if (!this.browser) {
        throw new Error('Browser not available')
      }

      // Create new page with specific settings
      page = await this.browser.newPage({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1366, height: 768 }
      })

      // Set timeouts
      page.setDefaultTimeout(30000) // 30 seconds
      page.setDefaultNavigationTimeout(30000)

      // Block unnecessary resources for faster loading
      await page.route('**/*', (route) => {
        const resourceType = route.request().resourceType()
        if (['image', 'font', 'media'].includes(resourceType)) {
          route.abort()
        } else {
          route.continue()
        }
      })

      console.log(`Navigating to LeadHoop URL for lead ${leadData.id}...`)
      
      // Navigate to the pre-filled URL
      const response = await page.goto(constructedUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      })

      if (!response) {
        throw new Error('No response received from LeadHoop portal')
      }

      const statusCode = response.status()
      console.log(`Portal response status: ${statusCode}`)

      // Take initial screenshot
      screenshotPath = await this.takeScreenshot(page, leadData.id, '_initial')

      // Check if page loaded successfully
      if (statusCode >= 400) {
        throw new Error(`Portal returned error status: ${statusCode}`)
      }

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle', { timeout: 10000 })

      // Look for forms on the page
      const forms = await page.locator('form').count()
      console.log(`Found ${forms} forms on the page`)

      // Check if this is a direct submission or requires form interaction
      const isDirectSubmission = forms === 0 || constructedUrl.includes('?')

      let submissionSuccess = false
      let finalScreenshotPath: string | undefined

      if (isDirectSubmission) {
        // For direct submission via URL parameters
        console.log('Processing as direct URL submission...')
        
        // Wait a bit for any JavaScript processing
        await page.waitForTimeout(2000)
        
        // Check for success indicators
        const successIndicators = [
          'success', 'thank you', 'submitted', 'complete',
          'confirmed', 'received', 'processed'
        ]
        
        const pageContent = await page.content()
        const pageText = await page.textContent('body') || ''
        
        submissionSuccess = successIndicators.some(indicator => 
          pageText.toLowerCase().includes(indicator) ||
          pageContent.toLowerCase().includes(indicator)
        )

        // Check for error indicators
        const errorIndicators = ['error', 'failed', 'invalid', 'required']
        const hasErrors = errorIndicators.some(indicator => 
          pageText.toLowerCase().includes(indicator)
        )

        if (hasErrors && !submissionSuccess) {
          throw new Error('Portal indicates submission errors')
        }

      } else {
        // For form-based submission
        console.log('Processing as form submission...')
        
        // Look for submit button
        const submitButton = page.locator('input[type="submit"], button[type="submit"], button:has-text("submit")').first()
        
        if (await submitButton.count() > 0) {
          console.log('Found submit button, clicking...')
          
          // Click submit button
          await submitButton.click()
          
          // Wait for navigation or response
          try {
            await page.waitForLoadState('networkidle', { timeout: 15000 })
          } catch (error) {
            console.warn('Timeout waiting for form submission response')
          }
          
          submissionSuccess = true
        } else {
          console.log('No submit button found - assuming pre-filled URL submission')
          submissionSuccess = true
        }
      }

      // Take final screenshot
      finalScreenshotPath = await this.takeScreenshot(page, leadData.id, '_final')
      
      const processingTime = Date.now() - startTime
      
      console.log(`LeadHoop submission completed for lead ${leadData.id} in ${processingTime}ms`)

      return {
        success: submissionSuccess,
        processingTimeMs: processingTime,
        screenshotPath: finalScreenshotPath || screenshotPath,
        portalResponseCode: statusCode,
        portalResponseMessage: submissionSuccess ? 'SUCCESS' : 'UNKNOWN_STATUS',
        responseData: {
          url: page.url(),
          finalStatus: submissionSuccess ? 'submitted' : 'uncertain'
        }
      }

    } catch (error) {
      const processingTime = Date.now() - startTime
      
      // Take error screenshot if page is available
      let errorScreenshotPath = screenshotPath
      if (page) {
        try {
          errorScreenshotPath = await this.takeScreenshot(page, leadData.id, '_error')
        } catch (screenshotError) {
          console.warn('Could not take error screenshot:', screenshotError)
        }
      }

      console.error(`LeadHoop submission failed for lead ${leadData.id}:`, error)

      return {
        success: false,
        processingTimeMs: processingTime,
        screenshotPath: errorScreenshotPath,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        portalResponseCode: 0,
        portalResponseMessage: 'ERROR'
      }

    } finally {
      // Clean up page
      if (page) {
        try {
          await page.close()
        } catch (error) {
          console.warn('Error closing page:', error)
        }
      }
    }
  }

  /**
   * Process a single lead through LeadHoop
   */
  async processLead(
    leadData: LeadData,
    config: LeadHoopConfig
  ): Promise<AutomationResult> {
    try {
      // Parse configuration
      const fieldMapping = JSON.parse(config.fieldMappingJson || '{}')
      const defaultValues = JSON.parse(config.defaultValuesJson || '{}')

      // Validate lead data
      const validationErrors = LeadHoopService.validateLeadData(leadData, fieldMapping)
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`)
      }

      // Construct URL
      const constructedUrl = LeadHoopService.constructUrl(
        config.portalUrl,
        leadData,
        fieldMapping,
        defaultValues
      )

      console.log(`Constructed URL for lead ${leadData.id}: ${constructedUrl.substring(0, 100)}...`)

      // Submit to LeadHoop
      const result = await this.submitToLeadHoop(leadData, config, constructedUrl)

      return result

    } catch (error) {
      console.error(`Error processing lead ${leadData.id}:`, error)
      
      return {
        success: false,
        processingTimeMs: 0,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Cleanup old screenshots
   */
  async cleanupOldScreenshots(daysOld: number = 7): Promise<void> {
    try {
      const files = await fs.readdir(this.screenshotDir)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      for (const file of files) {
        if (file.endsWith('.png')) {
          const filePath = path.join(this.screenshotDir, file)
          const stats = await fs.stat(filePath)
          
          if (stats.mtime < cutoffDate) {
            await fs.unlink(filePath)
            console.log(`Deleted old screenshot: ${file}`)
          }
        }
      }
    } catch (error) {
      console.warn('Error cleaning up screenshots:', error)
    }
  }
}

export default AutomationEngine