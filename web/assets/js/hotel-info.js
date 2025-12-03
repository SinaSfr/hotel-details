const onrenderedApiGallery = async () => {
  const smallGalleryEl = document.querySelector('.hotel-small-img-gallery')
  const bigGalleryEl = document.querySelector('.hotel-big-img-gallery')
  if (!smallGalleryEl || !bigGalleryEl) {
    console.warn('⚠️ گالری پیدا نشد، Swiper ساخته نشد.')
    return
  }

  const hotelSmallImgGallery = new Swiper('.hotel-small-img-gallery', {
    spaceBetween: 10,
    direction: 'vertical',
    slidesPerView: 3,
    freeMode: true,
    watchSlidesProgress: true,
  })

  const hotelBigImgGallery = new Swiper('.hotel-big-img-gallery', {
    spaceBetween: 10,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next-custom',
      prevEl: '.swiper-button-prev-custom',
    },
    thumbs: { swiper: hotelSmallImgGallery },
  })

  const hotelPopupModalGallery = document.getElementById(
    'hotelPopupModalGallery',
  )
  const popupContentGallery = document.querySelector(
    '.hotel-big-img-gallery-popup .swiper-wrapper',
  )
  const closePopupGallery = document.getElementById('closePopupGallery')
  const images = document.querySelectorAll(
    '.hotel-small-img-gallery .swiper-slide img',
  )
  const galleryCount = document.querySelector('.gallery-img-count')

  if (!hotelPopupModalGallery || !popupContentGallery || !closePopupGallery) {
    console.warn('⚠️ عناصر مربوط به پاپ‌آپ گالری پیدا نشدن.')
    return
  }

  const totalImages = images.length
  if (totalImages === 0) {
    console.warn('⚠️ هیچ تصویری برای گالری وجود ندارد.')
    return
  }

  let swiperPopup = null

  images.forEach((image, index) => {
    image.addEventListener('click', function () {
      popupContentGallery.innerHTML = ''

      images.forEach((thumbImage) => {
        const slide = document.createElement('div')
        slide.classList.add('swiper-slide')
        const thumbImageElement = document.createElement('img')
        thumbImageElement.src = thumbImage.src
        thumbImageElement.classList.add(
          'book-w-full',
          'book-h-full',
          'book-object-cover',
          'book-rounded',
        )
        slide.appendChild(thumbImageElement)
        popupContentGallery.appendChild(slide)
      })

      if (swiperPopup) swiperPopup.destroy(true, true)

      swiperPopup = new Swiper('.hotel-big-img-gallery-popup', {
        loop: true,
        initialSlide: index,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
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
      document.body.style.overflow = 'book-hidden'
    })
  })

  closePopupGallery.addEventListener('click', function () {
    hotelPopupModalGallery.classList.add('book-hidden')
    hotelPopupModalGallery.classList.remove('book-flex')
    document.body.style.overflow = ''
  })

  hotelPopupModalGallery.addEventListener('click', function (e) {
    if (e.target === hotelPopupModalGallery) {
      hotelPopupModalGallery.classList.add('book-hidden')
      hotelPopupModalGallery.classList.remove('book-flex')
      document.body.style.overflow = ''
    }
  })
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
      tab.addEventListener('click', () => setActiveTab(i))
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

document.addEventListener('DOMContentLoaded', () => {
  const selectBtn = document.querySelector('.room-select-btn')
  const optionsMenu = document.querySelector('.room-options')
  const options = document.querySelectorAll('.room-option')
  const selectText = document.querySelector('.room-select-text')
  const icon = selectBtn ? selectBtn.querySelector('svg') : null

  if (selectBtn && optionsMenu && selectText && icon) {
    selectBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      optionsMenu.classList.toggle('book-hidden')
      icon.classList.toggle('book-rotate-180')
    })

    options.forEach((option) => {
      option.addEventListener('click', () => {
        selectText.textContent = option.textContent.trim()
        optionsMenu.classList.add('book-hidden')
        icon.classList.remove('book-rotate-180')
      })
    })

    document.addEventListener('click', (e) => {
      if (!selectBtn.contains(e.target) && !optionsMenu.contains(e.target)) {
        optionsMenu.classList.add('book-hidden')
        icon.classList.remove('book-rotate-180')
      }
    })
  } else {
    console.warn('Some elements are missing in the DOM.')
  }
})
