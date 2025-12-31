;(function () {
  'use strict'

  // Prevent duplicate execution
  if (window.__CMS_DATA_INITIALIZED__) {
    console.warn(
      '⚠️ CMS data already initialized, skipping duplicate execution',
    )
    return
  }

  // ✅ Set flag immediately
  window.__CMS_DATA_INITIALIZED__ = true

  // ✅ Main initialization function
  async function initializeCmsData() {
    try {
      // Build window.cmsData object
      window.cmsData = {
        provider: '[##cms.form.provider-hotel##]',
        id: '[##cms.form.hotelid##]',
        optionId: '[##cms.form.optionId-hotel##]',
        usedforids: '[##cms.form.encoded_usedforid##]',
        sid: '[##cms.form.sid##]',
        clid: '[##cms.form.clid|(1)##]',
        dmnid: '[##cms.cms.domainid##]',
        HotelDate: '[##cms.form.Hotel-Date|(0)##]',
        cityid: '[##cms.form.cityid##]',
        coHotel: '[##cms.form.coHotel##]',
        roomSearch: '[##cms.json.header|cms.form.roomSearch##]',
        fdate: '[##cms.form.fdate##]',
        tdate: '[##cms.form.tdate##]',
        moneytype: '[##cms.form.moneytype##]',
      }

      // Run API logic
      if (typeof runApiLogic === 'function') {
        await runApiLogic()
      }
    } catch (error) {
      console.error('❌ CMS initialization failed:', error?.message || error)
      console.error('Stack:', error?.stack)

      // Reset flag on error for retry
      window.__CMS_DATA_INITIALIZED__ = false
      throw error
    }
  }

  // ✅ Execute based on DOM state
  if (document.readyState === 'loading') {
    // DOM not yet loaded
    document.addEventListener('DOMContentLoaded', initializeCmsData, {
      once: true,
    })
  } else {
    // DOM already ready
    initializeCmsData()
  }
})()
