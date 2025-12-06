const onrenderedApiGallery = async () => {
  galleryImgLoader = document.querySelector(".gallery-img-loader")
  galleryImgLoader.style.display = "none"
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
      tab.addEventListener('click', () => {
    
        setActiveTab(i);
    
        const targetSelector = tab.getAttribute("data-target");
    
        if (targetSelector) {
          const target = document.querySelector(targetSelector);
    
          if (target) {
            const offset = 60; 
    
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - offset;
    
            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth"
            });
    
          } else {
            console.warn("⚠️ No element found for:", targetSelector);
          }
    
        } else {
          console.warn("⚠️ This tab has NO data-target");
        }
    
      });
    });

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
  const selectBtn = event.target.closest('.room-select-btn');
  if (selectBtn) {
    event.stopPropagation();

    const container = selectBtn.parentElement; 
    const optionsMenu = container.querySelector('.room-options');
    const icon = selectBtn.querySelector('.close-room-btn');

    if (!optionsMenu || !icon) return;

    document.querySelectorAll('.room-options').forEach((menu) => {
      if (menu !== optionsMenu) menu.classList.add('book-hidden');
    });
    document.querySelectorAll('.close-room-btn').forEach((ic) => {
      if (ic !== icon) ic.classList.remove('book-rotate-180');
    });

    optionsMenu.classList.toggle('book-hidden');
    icon.classList.toggle('book-rotate-180');
    return;
  }

  const option = event.target.closest('.room-option');
  if (option) {
    const optionsMenu = option.closest('.room-options');
    const container = optionsMenu ? optionsMenu.parentElement : null;
    const selectText = container ? container.querySelector('.room-select-text') : null;
    const icon = container ? container.querySelector('.close-room-btn') : null;

    if (selectText) {
      selectText.textContent = option.textContent.trim();
    }
    if (optionsMenu) {
      optionsMenu.classList.add('book-hidden');
    }
    if (icon) {
      icon.classList.remove('book-rotate-180');
    }
    return;
  }

  document.querySelectorAll('.room-options').forEach((menu) => {
    menu.classList.add('book-hidden');
  });
  document.querySelectorAll('.close-room-btn').forEach((icon) => {
    icon.classList.remove('book-rotate-180');
  });
});
