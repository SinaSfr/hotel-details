const onrenderedApiGallery = async () => {
  const galleryImgLoader = document.querySelector('.gallery-img-loader')
  if (galleryImgLoader) galleryImgLoader.style.display = 'none'
  // 0) Elements
  const smallGalleryEl = document.querySelector('.hotel-small-img-gallery')
  const bigGalleryEl = document.querySelector('.hotel-big-img-gallery')
  if (!smallGalleryEl || !bigGalleryEl) {
    console.warn('⚠️ گالری پیدا نشد.')
    return
  }

  // 1) اول از src عکس‌های موجود مقدار بگیر (raw src)
  const smallImgs = document.querySelectorAll(
    '.hotel-small-img-gallery .swiper-slide img',
  )
  const bigImgs = document.querySelectorAll(
    '.hotel-big-img-gallery .swiper-slide img',
  )

  if (smallImgs.length === 0 && bigImgs.length === 0) {
    console.warn('⚠️ هیچ img داخل اسلایدها پیدا نشد.')
    return
  }

  // مبنا رو small می‌گیریم، اگر نبود big
  const baseImgs = smallImgs.length ? smallImgs : bigImgs

  // 2) نرمالایز + اگر / یا http(s) نداشت اضافه کن + دوباره src رو ست کن
  const imageLinks = Array.from(baseImgs)
    .map((img) => img.getAttribute('src') || '')
    .map((src) => {
      const url = (src || '').trim()
      if (!url) return null
      return url // هیچ تغییری نده
    })
    .filter(Boolean)

  // ست کردن src به ترتیب روی اسلایدهای موجود (بدون ساختن اسلاید جدید)
  imageLinks.forEach((src, i) => {
    if (smallImgs[i]) smallImgs[i].setAttribute('src', src)
    if (bigImgs[i]) bigImgs[i].setAttribute('src', src)
  })

  // اگر اسلاید اضافی توی HTML هست ولی لینک نداره → مخفی
  for (let i = imageLinks.length; i < smallImgs.length; i++) {
    smallImgs[i]?.closest('.swiper-slide')?.classList.add('book-hidden')
  }
  for (let i = imageLinks.length; i < bigImgs.length; i++) {
    bigImgs[i]?.closest('.swiper-slide')?.classList.add('book-hidden')
  }

  // 3) Swiper ها (اگر قبلاً ساخته شده‌اند دوباره نساز)
  const hotelSmallImgGallery =
    smallGalleryEl.swiper ||
    new Swiper('.hotel-small-img-gallery', {
      spaceBetween: 10,
      direction: 'horizontal',
      slidesPerView: 3,
      freeMode: true,
      watchSlidesProgress: true,
      breakpoints: {
        1024: {
          direction: 'vertical',
        },
      },
    })

  const hotelBigImgGallery =
    bigGalleryEl.swiper ||
    new Swiper('.hotel-big-img-gallery', {
      spaceBetween: 10,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: {
        nextEl: '.swiper-button-next-custom',
        prevEl: '.swiper-button-prev-custom',
      },
      thumbs: { swiper: hotelSmallImgGallery },
    })

  try {
    hotelSmallImgGallery.update()
    hotelBigImgGallery.update()
    hotelSmallImgGallery.slideTo(0, 0)
    hotelBigImgGallery.slideTo(0, 0)
  } catch (e) {}

  // 4) Popup
  const hotelPopupModalGallery = document.getElementById(
    'hotelPopupModalGallery',
  )
  const popupContentGallery = document.querySelector(
    '.hotel-big-img-gallery-popup .swiper-wrapper',
  )
  const closePopupGallery = document.getElementById('closePopupGallery')
  const galleryCount = document.querySelector('.gallery-img-count')

  if (!hotelPopupModalGallery || !popupContentGallery || !closePopupGallery) {
    console.warn('⚠️ عناصر مربوط به پاپ‌آپ گالری پیدا نشدن.')
    return
  }

  // جلوگیری از bind چندباره
  if (!hotelPopupModalGallery.dataset.bound) {
    hotelPopupModalGallery.dataset.bound = '1'

    closePopupGallery.addEventListener('click', () => {
      hotelPopupModalGallery.classList.add('book-hidden')
      hotelPopupModalGallery.classList.remove('book-flex')
      document.body.style.overflow = ''
    })

    hotelPopupModalGallery.addEventListener('click', (e) => {
      if (e.target === hotelPopupModalGallery) {
        hotelPopupModalGallery.classList.add('book-hidden')
        hotelPopupModalGallery.classList.remove('book-flex')
        document.body.style.overflow = ''
      }
    })
  }

  let swiperPopup = null

  // کلیک روی thumb ها با event delegation (بدون addEventListener روی تک‌تک img ها)
  if (!smallGalleryEl.dataset.clickBound) {
    smallGalleryEl.dataset.clickBound = '1'

    smallGalleryEl.addEventListener('click', (e) => {
      const img = e.target?.closest('img')
      if (!img) return

      // اگر اسلاید مخفی شده بود، کاری نکن
      if (img.closest('.swiper-slide')?.classList.contains('book-hidden'))
        return

      // لیست visible img ها (به ترتیب)
      const visibleImgs = Array.from(
        document.querySelectorAll('.hotel-small-img-gallery .swiper-slide img'),
      ).filter(
        (x) => !x.closest('.swiper-slide')?.classList.contains('book-hidden'),
      )

      const totalImages = visibleImgs.length
      if (totalImages === 0) return

      const index = visibleImgs.indexOf(img)
      if (index < 0) return

      // لینک‌ها رو از src های visible بساز (raw attribute)
      const popupLinks = visibleImgs
        .map((x) => x.getAttribute('src') || '')
        .filter(Boolean)

      // ساخت محتوای پاپاپ
      popupContentGallery.innerHTML = ''
      popupLinks.forEach((src) => {
        const slide = document.createElement('div')
        slide.className = 'swiper-slide'

        const im = document.createElement('img')
        im.setAttribute('src', src)
        im.classList.add(
          'book-w-full',
          'book-h-full',
          'book-object-cover',
          'book-rounded',
        )

        slide.appendChild(im)
        popupContentGallery.appendChild(slide)
      })

      if (swiperPopup) swiperPopup.destroy(true, true)

      swiperPopup = new Swiper('.hotel-big-img-gallery-popup', {
        loop: true,
        initialSlide: index,
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: {
          nextEl: '.swiper-button-next-popup',
          prevEl: '.swiper-button-prev-popup',
        },
        slidesPerView: 1,
        spaceBetween: 10,
        on: {
          init: function () {
            if (galleryCount) {
              galleryCount.textContent = `${
                this.realIndex + 1
              } از ${totalImages}`
            }
          },
          slideChange: function () {
            if (galleryCount) {
              galleryCount.textContent = `${
                this.realIndex + 1
              } از ${totalImages}`
            }
          },
        },
      })

      hotelPopupModalGallery.classList.remove('book-hidden')
      hotelPopupModalGallery.classList.add('book-flex')
      document.body.style.overflow = 'hidden'
    })
  }
}

// ---------active line-------------
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tabs').forEach((tabsWrapper) => {
    const tabsContainer = tabsWrapper.querySelector('.tabs-container')
    const tabs = tabsContainer.querySelectorAll('button')
    const line = tabsWrapper.querySelector('.active-line')

    function setActiveTab(index) {
      if (!tabs[index]) return

      tabs.forEach((tab, i) => {
        tab.classList.toggle('book-text-primary-300', i === index)
        tab.classList.toggle('book-font-medium', i === index)
        tab.classList.toggle('book-text-zinc-900', i !== index)
      })

      const tab = tabs[index]
      const tabRect = tab.getBoundingClientRect()
      const containerRect = tabsContainer.getBoundingClientRect()

      const tabLeft = tabRect.left - containerRect.left
      const width = tab.offsetWidth

      line.style.width = width + 'px'
      line.style.left = tabLeft + 'px'
    }

    setActiveTab(0)

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        setActiveTab(i)

        const targetSelector = tab.getAttribute('data-target')

        if (targetSelector) {
          const target = document.querySelector(targetSelector)

          if (target) {
            const offset = 60

            // استفاده از offsetTop برای موقعیت دقیق‌تر
            const elementPosition = target.offsetTop
            const offsetPosition = elementPosition + window.scrollY - offset

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            })
          } else {
            console.warn('⚠️ No element found for:', targetSelector)
          }
        } else {
          console.warn('⚠️ This tab has NO data-target')
        }
      })
    })

    tabsContainer.addEventListener('scroll', () => {
      const activeIndex = [...tabs].findIndex((tab) =>
        tab.classList.contains('book-text-primary-300'),
      )
      if (activeIndex >= 0) setActiveTab(activeIndex)
    })

    window.addEventListener('resize', () => {
      const activeIndex = [...tabs].findIndex((tab) =>
        tab.classList.contains('book-text-primary-300'),
      )
      setActiveTab(activeIndex >= 0 ? activeIndex : 0)
    })
  })
})

document.addEventListener('click', (event) => {
  const selectBtn = event.target.closest('.room-select-btn')
  if (selectBtn) {
    event.stopPropagation()

    const container = selectBtn.parentElement
    const optionsMenu = container.querySelector('.room-options')
    const icon = selectBtn.querySelector('.close-room-btn')

    if (!optionsMenu || !icon) return

    document.querySelectorAll('.room-options').forEach((menu) => {
      if (menu !== optionsMenu) menu.classList.add('book-hidden')
    })
    document.querySelectorAll('.close-room-btn').forEach((ic) => {
      if (ic !== icon) ic.classList.remove('book-rotate-180')
    })

    optionsMenu.classList.toggle('book-hidden')
    icon.classList.toggle('book-rotate-180')
    return
  }

  const option = event.target.closest('.room-option')
  if (option) {
    const optionsMenu = option.closest('.room-options')
    const container = optionsMenu ? optionsMenu.parentElement : null
    const selectText = container
      ? container.querySelector('.room-select-text')
      : null
    const icon = container ? container.querySelector('.close-room-btn') : null

    if (selectText) {
      selectText.textContent = option.textContent.trim()
    }
    if (optionsMenu) {
      optionsMenu.classList.add('book-hidden')
    }
    if (icon) {
      icon.classList.remove('book-rotate-180')
    }
    return
  }

  document.querySelectorAll('.room-options').forEach((menu) => {
    menu.classList.add('book-hidden')
  })
  document.querySelectorAll('.close-room-btn').forEach((icon) => {
    icon.classList.remove('book-rotate-180')
  })
})
