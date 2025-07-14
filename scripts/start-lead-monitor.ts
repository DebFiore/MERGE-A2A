#!/usr/bin/env tsx

import LeadMonitor from '../lib/lead-monitor'

async function main() {
  console.log('🚀 Starting MERGE AI LeadHoop Integration Service...')
  
  const monitor = new LeadMonitor()
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...')
    await monitor.stop()
    process.exit(0)
  })
  
  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...')
    await monitor.stop()
    process.exit(0)
  })
  
  try {
    await monitor.start()
    console.log('✅ LeadHoop Integration Service is running')
    console.log('📊 Monitoring confirmed leads every 30 seconds')
    console.log('⚡ Processing queue every 10 seconds')
    console.log('🔄 Press Ctrl+C to stop')
    
    // Keep the process alive
    process.stdin.resume()
    
  } catch (error) {
    console.error('❌ Failed to start LeadHoop Integration Service:', error)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})