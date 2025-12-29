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


/**
 * Global helper function to access cmsData
 * @param {string} key - Optional key to retrieve specific data
 * @returns {any} - Returns cmsData or specific value
 */
window.getCmsData = function (key) {
    if (!window.cmsData) {
        console.warn('⚠️ cmsData not initialized yet');
        return null;
    }
    return key ? window.cmsData[key] : window.cmsData;
};

/**
 * Sets up the token data and updates the UI based on hotel search parameters
 * @param {Object} args - Arguments containing source data
 * @returns {void}
 */
const setToken = async (args) => {
    try {
        // Update token data
        $bc.setSource("cms.data", {
            token: args.source.rows[0].token,
            lang: currentLanguage,
            id: id,
            name: hotelName,
            usedforids: usedforids,
            run: true
        });

    } catch (error) {
        console.error("setToken: " + error.message);
    }
};

/**
 * Function to assign values from window.cmsData and trigger API call if provider is allowed
 * @returns {Promise<void>}
 */
async function runApiLogic() {
    try {
        // Destructure provider and id from cmsData
        ({
            provider,
            id,
            optionId,
            usedforids
        } = window.cmsData);

        // List of allowed provider IDs
        const allowedProviders = [
            '0', '29', '41', '46', '58',
            '70', '75', '82', '88', '102',
            '106', '109'
        ];

        const fetchHotelImages = async () => {
            try {
                const formData = new FormData();
                formData.append("optionId", "[##cms.form.optionId-hotel##]");
                formData.append("sid", window.cmsData.sid);

                const response = await fetch("/Client_Hotel_Image_Json.bc", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`Error retrieving data: ${response.statusText}`);
                }

                const jsonObject = await response.json();

                // ✅ اگر ریسپانس { msg: 'no data' } بود
                if (
                    jsonObject &&
                    !Array.isArray(jsonObject) &&
                    typeof jsonObject === "object" &&
                    (jsonObject.msg === "no data" || jsonObject.msg === "no_data")
                ) {
                    $bc.setSource("api.newGallery", []);
                    return [];
                }

                // اگر آرایه نبود هم امن‌سازی
                const safeArray = Array.isArray(jsonObject) ? jsonObject : [];

                const updatedData = safeArray.map((item) => {
                    const updatedItem = { ...item };

                    if (updatedItem.largeIMG) {
                        let url = updatedItem.largeIMG;

                        const hasDomain = url.startsWith("http://") || url.startsWith("https://");
                        if (!hasDomain && !url.startsWith("/")) url = "/" + url;

                        updatedItem.originalImage = url;
                        delete updatedItem.largeIMG;
                    }

                    return updatedItem;
                });

                $bc.setSource("api.newGallery", updatedData);
                return updatedData;
            } catch (error) {
                console.error("error:", error);
                $bc.setSource("api.newGallery", []);
                return [];
            }
        };

        const fetchHotelInfo = async () => {
            try {
                const formData = new FormData();
                formData.append('optionId', '[##cms.form.optionId-hotel##]');
                formData.append('clid', window.cmsData.clid);

                const response = await fetch('/Client_Hotel_Info_Json.bc', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`Error retrieving data: ${response.statusText}`);
                }

                const responseText = await response.text();
                const correctedJsonText = responseText.replace(/'/g, '"');

                try {
                    const jsonObject = JSON.parse(correctedJsonText);

                    $bc.setSource("api.info", correctedJsonText);
                } catch (jsonError) {
                    console.error('Invalid JSON:', jsonError);
                }

            } catch (error) {
                console.error('error:', error);
            }
        };


        // Check if provider is in allowed list and trigger API call
        if (allowedProviders.includes(String(provider))) {
            $bc.setSource("cms.token");
        } else {
            fetchHotelImages();
            fetchHotelInfo();
        }



        const formBody = new URLSearchParams();
        formBody.append('optionId', optionId);
        // formBody.append('lid', LID);

        const response = await fetch('/Client_Hotel_ShowAllRooms.bc?clid=2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: formBody.toString()
        });

        const rawText = await response.text();
        const fixedText = rawText.replace(/'/g, '"');
        const result = JSON.parse(fixedText);
        $bc.setSource("room.list", result)
    } catch (error) {
        console.error("runApiLogic error: " + error.message);
    }
}


/**
 * Finds a property value from JSON data using section ID and property ID
 * @param {Array} data - Array of hotel data sections
 * @param {number} sectionId - ID of the section to search
 * @param {number} propertyId - ID of the property to find
 * @returns {string|null} - Property value text or null if not found
 */

function normalizeRawJSON(data) {
    try {
        if (data && data.rows && Array.isArray(data.rows)) {
            data = data.rows;
        }

        if (typeof data === "string") {
            data = JSON.parse(data);
        }

        if (Array.isArray(data) && data.length === 1 && typeof data[0].value === "string") {
            data = JSON.parse(data[0].value);
        }

        if (!Array.isArray(data)) {
            console.warn("normalizeRawJSON: data is not an array", data);
            return [];
        }
        return data;
    } catch (e) {
        console.error("normalizeRawJSON: invalid JSON", e);
        return [];
    }
}

function normalizeRestfulAnswers(answers) {
    if (!Array.isArray(answers)) return [];

    const flat = [];

    answers.forEach(val => {
        if (Array.isArray(val)) {
            val.forEach(v => flat.push(v));
        } else {
            flat.push(val);
        }
    });

    return flat.map(v => ({
        text: String(v)
    }));
}


function restfulToUnifiedSections(arr) {
    const allProps = [];

    arr.forEach(item => {
        if (item && item.properties && !Array.isArray(item.properties) && typeof item.properties === "object") {
            Object.entries(item.properties).forEach(([title, obj]) => {
                const answers = obj?.answers ?? [];
                const normalized = normalizeRestfulAnswers(answers);
                allProps.push({
                    title,
                    answer: normalized
                });
            });
        }
    });


    return [
        {
            title: "مشخصات هتل",
            properties: allProps
        }
    ];
}

function externalToUnifiedSections(sections) {
    if (!Array.isArray(sections)) return [];

    return sections.map(section => ({
        title: section.title,
        properties: Array.isArray(section.properties)
            ? section.properties.map(p => ({
                title: p.title,
                answer: Array.isArray(p.answer)
                    ? p.answer.map(a => ({
                        text: String(
                            (a && typeof a === "object" && "text" in a)
                                ? a.text
                                : a
                        )
                    }))
                    : []
            }))
            : []
    }));
}

function unifyHotelData(data) {
    const raw = normalizeRawJSON(data);
    if (!raw.length) return [];

    const first = raw[0];

    if (first && Array.isArray(first.properties)) {
        return externalToUnifiedSections(raw);
    }

    if (first && first.properties && !Array.isArray(first.properties)) {
        return restfulToUnifiedSections(raw);
    }

    if (first && typeof first.title === "string" && Array.isArray(first.properties)) {
        return externalToUnifiedSections(raw);
    }

    console.warn("unifyHotelData: unknown structure", raw);
    return [];
}
function getCurrentLang() {
    const clid = Number(window.cmsData?.clid);

    if (clid === 2) return "en";
    if (clid === 3) return "ar";
    return "fa";
}
function getProperty(data, propTitles, sectionTitles = null, opts = {}) {
    try {
        const sections = unifyHotelData(data);
        if (!sections.length) return opts.list ? [] : null;

        const lang = getCurrentLang(); // "fa" | "en" | "ar"

        const pickTitle = (titles) => {
            if (typeof titles === "string") return titles.trim();
            if (titles && typeof titles === "object") {
                const t = titles[lang] || titles.fa || Object.values(titles)[0];
                return String(t || "").trim();
            }
            return null;
        };

        const propTitle = pickTitle(propTitles);
        if (!propTitle) return opts.list ? [] : null;

        const sectionTitle = sectionTitles ? pickTitle(sectionTitles) : null;

        for (const section of sections) {
            if (sectionTitle && String(section.title).trim() !== sectionTitle) continue;
            if (!Array.isArray(section.properties)) continue;

            const property = section.properties.find(
                (p) => String(p.title).trim() === propTitle
            );

            if (!property || !Array.isArray(property.answer)) continue;

            const values = property.answer
                .map((a) => {
                    const raw = (a && typeof a === "object" && "text" in a) ? a.text : a;
                    return raw != null ? String(raw).trim() : "";
                })
                .filter(Boolean);

            // ✅ اینجا تصمیم می‌گیریم چی برگرده
            if (opts.list) return values;                 // همیشه آرایه
            return values.length ? values[0] : null;      // تک مقدار
        }

        return opts.list ? [] : null;
    } catch (error) {
        console.error("Error in getProperty:", error);
        return opts.list ? [] : null;
    }
}


function getSectionHTML(data, sectionTitles) {
    try {
        const sections = unifyHotelData(data);
        if (!sections.length) return "";

        const lang = getCurrentLang();


        let secTitle = null;
        if (typeof sectionTitles === "string") {
            secTitle = sectionTitles.trim();
        } else if (sectionTitles && typeof sectionTitles === "object") {
            secTitle =
                sectionTitles[lang] ||
                sectionTitles.fa ||
                Object.values(sectionTitles)[0]; // fallback
            secTitle = String(secTitle).trim();
        } else {
            return "";
        }

        const section = sections.find(
            sec => String(sec.title).trim() === secTitle
        );

        if (!section || !Array.isArray(section.properties) || !section.properties.length) {
            return "";
        }

        const prop = section.properties[0];
        if (!prop) return "";

        if (Array.isArray(prop.answer) && prop.answer.length > 0) {
            const first = prop.answer[0];
            const raw = (first && typeof first === "object" && "text" in first)
                ? first.text
                : first;
            return raw != null ? String(raw) : "";
        }

        return prop.title ? String(prop.title) : "";
    } catch (e) {
        console.error("Error in getSectionHTML:", e);
        return "";
    }
}


function renderListWithIcon(targetSelector, items, opts = {}) {
    const {
        emptyText = "—",
        emptyClass = "book-text-xs book-text-zinc-400 book-col-span-full",
        itemClass = "book-flex book-items-center book-gap-2",
        textClass = "book-text-xs book-text-zinc-600",
        icon = `
<svg class="book-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd"
  d="M15.993 10.222L11.375 14.84C11.228 14.987 11.037 15.06 10.845 15.06C10.652 15.06 10.461 14.987 10.314 14.84L8.005 12.531C7.712 12.238 7.712 11.763 8.005 11.47C8.298 11.177 8.772 11.177 9.065 11.47L10.845 13.249L14.932 9.161C15.225 8.868 15.7 8.868 15.993 9.161C16.286 9.454 16.286 9.929 15.993 10.222ZM12 2.5C6.762 2.5 2.5 6.762 2.5 12C2.5 17.239 6.762 21.5 12 21.5C17.238 21.5 21.5 17.239 21.5 12C21.5 6.762 17.238 2.5 12 2.5Z"
  fill="#18181B" />
</svg>
`,
    } = opts;

    // normalize items
    const list = Array.isArray(items)
        ? items.map(x => (x != null ? String(x).trim() : "")).filter(Boolean)
        : [];

    document.querySelectorAll(targetSelector).forEach((container) => {
        container.innerHTML = "";

        // ✅ اگر خالی بود، فقط یک خط بذار
        if (!list.length) {
            const emptyEl = document.createElement("div");
            emptyEl.className = emptyClass;
            emptyEl.textContent = emptyText;
            container.appendChild(emptyEl);
            return;
        }

        // ✅ اگر پر بود، آیتم‌ها رو بساز
        list.forEach((item) => {
            const wrapper = document.createElement("div");
            wrapper.className = itemClass;
            wrapper.innerHTML = `${icon}<span class="${textClass}">${item}</span>`;
            container.appendChild(wrapper);
        });
    });
}




/**
 * Generates star rating HTML based on rating number
 * @param {string|number} rating - Rating value (number of stars)
 * @returns {string} - HTML string with star SVG icons
 */
const generateStars = (rating) => {
    try {
        let starsHtml = '';
        const stars = parseInt(rating) || 0;

        // Generate star icons
        for (let i = 0; i < stars; i++) {
            starsHtml += `
      <svg width="24" height="24">
          <use href="/booking/images/sprite-hotelDetails-icons.svg#icon-golden-star"></use>
      </svg>
  `;
        }
        return starsHtml;
    } catch (error) {
        console.error("generateStars error: " + error.message);
        return '';
    }
}

/**
 * Populates hotel information on the page from JSON data
 * Updates DOM elements with hotel details like title, rating, contact info, etc.
 * @param {Object} args - Arguments object containing source data
 * @returns {Promise<void>}
 */
const setInfo = async (args) => {
    try {
        // Extract data from args
        const data = args.source?.rows || args.source;
        const HOTEL_FIELD_TITLES = {
            // عنوان / نام هتل
            name: {
                prop: { fa: "عنوان", en: "Hotel Name" },
                section: { fa: "مشخصات هتل", en: "General specifications" }
            },

            // درجه / ستاره هتل
            rating: {
                prop: { fa: "درجه", en: "star rating" },
                section: { fa: "مشخصات هتل", en: "General specifications" }
            },

            // کشور
            country: {
                prop: { fa: "کشور", en: "country" },
                section: { fa: "مشخصات هتل", en: "Connections" }
            },

            // شهر
            city: {
                prop: { fa: "شهر", en: "city" },
                section: { fa: "مشخصات هتل", en: "Connections" }
            },

            // آدرس
            address: {
                prop: { fa: "آدرس", en: "Address" },
                section: { fa: "مشخصات هتل", en: "contact" }
            },

            // تلفن
            phone: {
                prop: { fa: "تلفن", en: "Phone" },
                section: { fa: "مشخصات هتل", en: "contact" }
            },

            // فکس
            fax: {
                prop: { fa: "فکس", en: "Fax" },
                section: { fa: "مشخصات هتل", en: "contact" }
            },

            // وب‌سایت
            website: {
                prop: { fa: "وب سایت", en: "Website" },
                section: { fa: "مشخصات هتل", en: "contact" }
            },

            // ایمیل
            email: {
                prop: { fa: "ایمیل", en: "Email" },
                section: { fa: "مشخصات هتل", en: "contact" }
            },

            // زمان تحویل گرفتن (Check-in)
            checkin: {
                prop: { fa: "زمان تحویل گرفتن", en: "Check-in time" },
                section: { fa: "مشخصات هتل", en: "General specifications" }
            },

            // زمان تحویل دادن (Check-out)
            checkout: {
                prop: { fa: "زمان تحویل دادن", en: "Check-out time" },
                section: { fa: "مشخصات هتل", en: "General specifications" }
            },

            // امکانات هتل (لیست)
            facilities: {
                prop: { fa: "امکانات هتل", en: "hotel facilities" },
                section: { fa: "مشخصات هتل", en: "Facilities" }
            },

            roomFacilities: {
                prop: { fa: "امکانات اتاق", en: "room facilities" },
                section: { fa: "مشخصات هتل", en: "Facilities" }
            },

            // GPS
            gps: {
                prop: { fa: "سیستم موقعیت یابی جهانی", en: "GPS" },
                section: { fa: "مشخصات هتل", en: "Hotel space" },
            },

            // توضیحات (HTML)
            description: {
                // برای توضیحات، عنوان سکشن مهم‌تر از عنوان پراپرتی‌ه
                section: { fa: "توضیحات", en: "Description" }
            },

            // اضافه کن به HOTEL_FIELD_TITLES
            floors: {
                prop: { fa: "تعداد طبقات(ساختمان)", en: "Number of floors (building)" },
                section: { fa: "مشخصات هتل", en: "General specifications" },
            },
            roomsCount: {
                prop: { fa: "تعداد اتاق ها", en: "Number of rooms" },
                section: { fa: "مشخصات هتل", en: "General specifications" },
            },
            internetService: {
                prop: { fa: "سرویس اینترنت", en: "Internet service" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },
            tv: {
                prop: { fa: "تلویزیون", en: "TV" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },
            bathroom: {
                prop: { fa: "حمام", en: "Bathroom" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },
            sports: {
                prop: { fa: "ورزش و تفریحات", en: "Sports & recreation" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },
            view: {
                prop: { fa: "چشم انداز", en: "View" },
                section: { fa: "مشخصات هتل", en: "General specifications" },
            },
            parking: {
                prop: { fa: "پارکینگ", en: "Parking" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },
            beachFacilities: {
                prop: { fa: "امکانات ساحلی", en: "Beach facilities" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },

            buildingsCount: {
                prop: { fa: "تعداد ساختمان ها", en: "Number of buildings" },
                section: { fa: "مشخصات هتل", en: "General specifications" },
            },
            buildYear: {
                prop: { fa: "سال ساخت", en: "Year built" },
                section: { fa: "مشخصات هتل", en: "General specifications" },
            },
            restaurantsCount: {
                prop: { fa: "تعداد رستوران ها", en: "Number of restaurants" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },
            poolOutdoorCount: {
                prop: { fa: "تعداد استخرهای سرباز", en: "Outdoor pools count" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },
            poolIndoorCount: {
                prop: { fa: "تعداد استخرهای سرپوشیده", en: "Indoor pools count" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },
            barsCount: {
                prop: { fa: "تعداد بارها", en: "Bars count" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },
            poolBarsCount: {
                prop: { fa: "تعداد بار استخر", en: "Pool bars count" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },
            meetingRoomsCount: {
                prop: { fa: "تعداد اتاق های ملاقات", en: "Meeting rooms count" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },

            petsMaxWeight: {
                prop: { fa: "حداکثر وزن حیوانات", en: "Max pets weight" },
                section: { fa: "مشخصات هتل", en: "General specifications" },
            },
            petsMaxPerRoom: {
                prop: { fa: "حداکثر تعداد حیوانات خانگی مجاز در هر اتاق", en: "Max pets per room" },
                section: { fa: "مشخصات هتل", en: "General specifications" },
            },

            paymentType: {
                prop: { fa: "نوع پرداخت", en: "Payment type" },
                section: { fa: "مشخصات هتل", en: "General specifications" },
            },
            creditCards: {
                prop: { fa: "کارت های اعتباری", en: "Credit cards" },
                section: { fa: "مشخصات هتل", en: "General specifications" },
            },
            transportServices: {
                prop: { fa: "خدمات رفت و آمد به", en: "Shuttle / transport to" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },
            minCheckinAge: {
                prop: { fa: "حداقل سن پذیرش", en: "Minimum check-in age" },
                section: { fa: "مشخصات هتل", en: "General specifications" },
            },

            postalCode: {
                prop: { fa: "کد پستی", en: "Postal code" },
                section: { fa: "مشخصات هتل", en: "contact" },
            },
            propertyType: {
                prop: { fa: "نوع اقامتگاه", en: "Property type" },
                section: { fa: "مشخصات هتل", en: "General specifications" },
            },
            cleaning: {
                prop: { fa: "نظافت", en: "Cleaning" },
                section: { fa: "مشخصات هتل", en: "General specifications" },
            },

            staffLanguages: {
                prop: { fa: "کارکنان مسلط به زبان", en: "Staff languages" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },
            roomTypes: {
                prop: { fa: "انواع اتاق", en: "Room types" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },
            bedTypes: {
                prop: { fa: "انواع تخت", en: "Bed types" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },

            beautyHygieneServices: {
                prop: { fa: "خدمات آرایشی و بهداشتی", en: "Beauty & hygiene services" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },
            tvChannels: {
                prop: { fa: "کانال های تلویزیونی", en: "TV channels" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },
            cafesCount: {
                prop: { fa: "تعداد کافی شاپ", en: "Cafes count" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },
            conferenceHallsCount: {
                prop: { fa: "تعداد سالن کنفرانس", en: "Conference halls count" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },
            roomSize: {
                prop: { fa: "ابعاد اتاق", en: "Room size" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },
            tennisCourtsCount: {
                prop: { fa: "تعداد زمین تنیس", en: "Tennis courts count" },
                section: { fa: "مشخصات هتل", en: "Facilities" },
            },
            airConditioning: {
                prop: { fa: "سیستم تهویه", en: "Air conditioning" },
                section: { fa: "مشخصات هتل", en: "Facilities" }
            },
            disabledFacilities: {
                prop: { fa: "امکانات معلولین", en: "Accessible facilities" },
                section: { fa: "مشخصات هتل", en: "Facilities" }
            },
            breakfast: {
                prop: { fa: "سرویس صبحانه", en: "Breakfast service" },
                section: { fa: "مشخصات هتل", en: "Facilities" }
            },
            lunch: {
                prop: { fa: "سرویس ناهار", en: "Lunch service" },
                section: { fa: "مشخصات هتل", en: "Facilities" }
            },
            dinner: {
                prop: { fa: "سرویس شام", en: "Dinner service" },
                section: { fa: "مشخصات هتل", en: "Facilities" }
            },
            smoking: {
                prop: { fa: "سیگار کشیدن", en: "Smoking" },
                section: { fa: "مشخصات هتل", en: "General specifications" }
            },
        };

        // --- language detect (fa vs en) ---
        const lang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
        const dir = (document.documentElement.getAttribute("dir") || "").toLowerCase();
        const isFa = lang.startsWith("fa") || lang.startsWith("ar") || dir === "rtl";

        const hotelTitle = getProperty(
            data,
            HOTEL_FIELD_TITLES.name.prop,
            HOTEL_FIELD_TITLES.name.section
        );
        if (hotelTitle) {
            document.querySelectorAll('.book-hotel__title')
                .forEach(el => el.textContent = hotelTitle);
        }

        const hotelRatingRaw = getProperty(
            data,
            HOTEL_FIELD_TITLES.rating.prop,
            HOTEL_FIELD_TITLES.rating.section
        );
        if (hotelRatingRaw) {
            const hotelRating = Number(hotelRatingRaw);

            const starsContainer = document.querySelector('.book-hotel__stars');
            if (starsContainer) {
                starsContainer.innerHTML = generateStars(hotelRating);
            }
        }

        const website = getProperty(
            data,
            HOTEL_FIELD_TITLES.website.prop,
            HOTEL_FIELD_TITLES.website.section
        );
        if (website) {
            const websiteElement = document.querySelector('.book-hotel__website');
            if (websiteElement) {
                websiteElement.textContent = website;
                websiteElement.setAttribute('href', website);
                // اضافه کردن کلاس‌ها برای هاور و خط زیر
                websiteElement.classList.add("book-relative", "book-group", "book-text-sm", "book-text-zinc-900", "book-transition-all", "book-duration-300", "hover:book-text-primary-300");
                websiteElement.innerHTML += `<span class="book-absolute -book-bottom-1 book-right-0 book-w-0 book-transition-all book-duration-300 book-h-px book-bg-primary-300 group-hover:book-w-full"></span>`;
            }

            const websiteElementWrapper = document.querySelector('.book-hotel__website__wrapper');
            if (websiteElementWrapper) {
                websiteElementWrapper.classList.remove("book-hidden");
                websiteElementWrapper.classList.add("book-flex");
            }
        }

        const address = getProperty(
            data,
            HOTEL_FIELD_TITLES.address.prop,
            HOTEL_FIELD_TITLES.address.section
        );
        if (address) {
            const addressElement = document.querySelector('.book-hotel__address');
            if (addressElement) {
                addressElement.textContent = address;
            }

            const addressElementWrapper = document.querySelector('.book-hotel__address__wrapper');
            if (addressElementWrapper) {
                addressElementWrapper.classList.remove("book-hidden");
                addressElementWrapper.classList.add("book-flex");
            }
        }

        const phone = getProperty(
            data,
            HOTEL_FIELD_TITLES.phone.prop,
            HOTEL_FIELD_TITLES.phone.section
        );

        if (phone) {
            const phoneElement = document.querySelector('.book-hotel__phones');
            if (phoneElement) {
                phoneElement.innerHTML = `
    <a href="tel:${phone}" class="book-relative book-group book-text-sm book-text-zinc-900 book-transition-all book-duration-300 hover:book-text-primary-300">
        ${phone}
        <span class="book-absolute -book-bottom-1 book-right-0 book-w-0 book-transition-all book-duration-300 book-h-px book-bg-primary-300 group-hover:book-w-full"></span>
    </a>
`;
            }

            const phoneElementWrapper = document.querySelector('.book-hotel__phones__wrapper');
            if (phoneElementWrapper) {
                phoneElementWrapper.classList.remove("book-hidden");
                phoneElementWrapper.classList.add("book-flex");
            }
        }

        const email = getProperty(
            data,
            HOTEL_FIELD_TITLES.email.prop,
            HOTEL_FIELD_TITLES.email.section
        );

        if (email) {
            const emailElement = document.querySelector('.book-hotel__email');
            if (emailElement) {
                emailElement.textContent = email;
                emailElement.setAttribute('href', `mailto:${email}`);

                // اضافه کردن کلاس‌ها برای هاور و خط زیر
                emailElement.classList.add("book-relative", "book-group", "book-text-sm", "book-text-zinc-900", "book-transition-all", "book-duration-300", "hover:book-text-primary-300");
                emailElement.innerHTML += `
    <span class="book-absolute -book-bottom-1 book-right-0 book-w-0 book-transition-all book-duration-300 book-h-px book-bg-primary-300 group-hover:book-w-full"></span>
`;
            }

            const emailElementWrapper = document.querySelector('.book-hotel__email__wrapper');
            if (emailElementWrapper) {
                emailElementWrapper.classList.remove("book-hidden");
                emailElementWrapper.classList.add("book-flex");
            }
        }

        const fax = getProperty(
            data,
            HOTEL_FIELD_TITLES.fax.prop,
            HOTEL_FIELD_TITLES.fax.section
        );
        if (fax) {
            const faxElement = document.querySelector('.book-hotel__fax');
            if (faxElement) {
                faxElement.textContent = fax;
            }

            const faxElementWrapper = document.querySelector('.book-hotel__fax__wrapper');
            if (faxElementWrapper) {
                faxElementWrapper.classList.remove("book-hidden");
                faxElementWrapper.classList.add("book-flex");
            }
        }
        // زمان تحویل گرفتن (Check-in)
        const checkIn = getProperty(
            data,
            HOTEL_FIELD_TITLES.checkin.prop,
            HOTEL_FIELD_TITLES.checkin.section
        );
        const checkInElement = document.querySelector(".book-hotel__checkin__time");
        const checkInWrapper = document.querySelector(".book-hotel__checkin__wrapper");

        if (checkIn && checkInElement) {
            checkInElement.textContent = checkIn;

            if (checkInWrapper) {
                checkInWrapper.classList.remove("book-hidden");
                checkInWrapper.classList.add("book-flex");
            }
        } else {
            if (checkInWrapper) {
                checkInWrapper.classList.add("book-hidden");
                checkInWrapper.classList.remove("book-flex");
            }
        }


        const checkOut = getProperty(
            data,
            HOTEL_FIELD_TITLES.checkout.prop,
            HOTEL_FIELD_TITLES.checkout.section
        );
        const checkOutElement = document.querySelector(".book-hotel__checkout__time");
        const checkOutWrapper = document.querySelector(".book-hotel__checkout__wrapper");

        if (checkOut && checkOutElement) {
            checkOutElement.textContent = checkOut;

            if (checkOutWrapper) {
                checkOutWrapper.classList.remove("book-hidden");
                checkOutWrapper.classList.add("book-flex");
            }
        } else {
            if (checkOutWrapper) {
                checkOutWrapper.classList.add("book-hidden");
                checkOutWrapper.classList.remove("book-flex");
            }
        }

        const facilities = getProperty(
            data,
            HOTEL_FIELD_TITLES.facilities.prop,
            HOTEL_FIELD_TITLES.facilities.section,
            { list: true }
        );

        const facilitiesContainer = document.querySelector(".book-hotel__facilities");
        const moreInfoBtn = document.querySelector(".open-hotel-moreinfo-btn");
        if (!facilitiesContainer) return;

        const facilitiesEmptyText = isFa
            ? "امکاناتی برای این هتل ثبت نشده است"
            : "No hotel facilities have been provided";

        facilitiesContainer.innerHTML = "";

        if (Array.isArray(facilities) && facilities.length) {
            if (moreInfoBtn) {
                moreInfoBtn.classList.remove("book-hidden");
                moreInfoBtn.classList.add("book-flex");
            }

            facilities.forEach((item) => {
                const wrapper = document.createElement("div");
                wrapper.className = "book-flex book-items-center book-gap-2";

                const icon = `
<svg class="book-shrink-0" width="24" height="24" viewBox="0 0 24 24" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd"
  d="M15.993 10.222L11.375 14.84C11.228 14.987 11.037 15.06 10.845 15.06C10.652 15.06 10.461 14.987 10.314 14.84L8.005 12.531C7.712 12.238 7.712 11.763 8.005 11.47C8.298 11.177 8.772 11.177 9.065 11.47L10.845 13.249L14.932 9.161C15.225 8.868 15.7 8.868 15.993 9.161C16.286 9.454 16.286 9.929 15.993 10.222ZM12 2.5C6.762 2.5 2.5 6.762 2.5 12C2.5 17.239 6.762 21.5 12 21.5C17.238 21.5 21.5 17.239 21.5 12C21.5 6.762 17.238 2.5 12 2.5Z"
  fill="#18181B" />
</svg>
`;

                wrapper.innerHTML = `
${icon}
<span class="book-text-xs book-text-zinc-600">${item}</span>
`;

                facilitiesContainer.appendChild(wrapper);
            });
        } else {
            facilitiesContainer.innerHTML = `
<div class="book-text-sm book-text-zinc-500 book-py-3">
${facilitiesEmptyText}
</div>
`;

            if (moreInfoBtn) {
                moreInfoBtn.classList.add("book-hidden");
                moreInfoBtn.classList.remove("book-flex");
            }
        }


        const roomFacilities = getProperty(
            data,
            HOTEL_FIELD_TITLES.roomFacilities.prop,
            HOTEL_FIELD_TITLES.roomFacilities.section,
            { list: true }
        );

        const roomFacilitiesContainer = document.querySelector(".book-room__facilities");
        if (!roomFacilitiesContainer) return;

        const emptyText = isFa
            ? "امکاناتی برای این اتاق ثبت نشده است"
            : "No room facilities have been provided";

        roomFacilitiesContainer.innerHTML = "";

        if (Array.isArray(roomFacilities) && roomFacilities.length) {
            roomFacilities.forEach((item) => {
                const wrapper = document.createElement("div");
                wrapper.className = "book-flex book-items-center book-gap-1";

                const icon = `
<svg class="book-shrink-0" width="24" height="24" viewBox="0 0 24 24" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd"
  d="M15.993 10.222L11.375 14.84C11.228 14.987 11.037 15.06 10.845 15.06C10.652 15.06 10.461 14.987 10.314 14.84L8.005 12.531C7.712 12.238 7.712 11.763 8.005 11.47C8.298 11.177 8.772 11.177 9.065 11.47L10.845 13.249L14.932 9.161C15.225 8.868 15.7 8.868 15.993 9.161C16.286 9.454 16.286 9.929 15.993 10.222ZM12 2.5C6.762 2.5 2.5 6.762 2.5 12C2.5 17.239 6.762 21.5 12 21.5C17.238 21.5 21.5 17.239 21.5 12C21.5 6.762 17.238 2.5 12 2.5Z"
  fill="#18181B" />
</svg>
`;

                wrapper.innerHTML = `
${icon}
<span class="book-text-xs book-text-zinc-600">${item}</span>
`;

                roomFacilitiesContainer.appendChild(wrapper);
            });
        } else {
            roomFacilitiesContainer.innerHTML = `
<div class="book-text-sm book-text-zinc-500 book-py-3">
${emptyText}
</div>
`;
        }

        const gps = getProperty(
            data,
            HOTEL_FIELD_TITLES.gps.prop,
            HOTEL_FIELD_TITLES.gps.section,
            { list: true }
        );

        if (Array.isArray(gps) && gps.length >= 2) {
            const lat = gps[0];
            const lng = gps[1];

            const locationElement = document.querySelector('.book-hotel__location');
            if (locationElement) {
                locationElement.src = `https://www.google.com/maps?q=${lat},${lng}&output=embed`;
            }
        }

        const description = getSectionHTML(
            data,
            HOTEL_FIELD_TITLES.description.section
        );
        if (description) {
            const descElement = document.querySelector('.book-hotel__description');
            if (descElement) {
                descElement.innerHTML = description;
            }
        }

        const floorsRaw = getProperty(
            data,
            HOTEL_FIELD_TITLES.floors.prop,
            HOTEL_FIELD_TITLES.floors.section
        );

        if (floorsRaw) {
            document.querySelectorAll('.book-hotel__floors')
                .forEach(el => el.textContent = floorsRaw);
        }

        const roomsCountRaw = getProperty(
            data,
            HOTEL_FIELD_TITLES.roomsCount.prop,
            HOTEL_FIELD_TITLES.roomsCount.section
        );

        if (roomsCountRaw) {
            document.querySelectorAll('.book-hotel__rooms-count')
                .forEach(el => el.textContent = roomsCountRaw);
        }

        const internetValues = getProperty(
            data,
            HOTEL_FIELD_TITLES.internetService.prop,
            HOTEL_FIELD_TITLES.internetService.section,
            { list: true }
        );

        if (internetValues.length) {
            const text = internetValues.join('، ');
            document.querySelectorAll('.book-hotel__internet')
                .forEach(el => el.textContent = text);
        }

        const floors = getProperty(data, HOTEL_FIELD_TITLES.floors.prop, HOTEL_FIELD_TITLES.floors.section);
        if (floors) {
            document.querySelectorAll(".book-hotel__moreinfo__floors")
                .forEach(el => el.textContent = floors);
        }

        // roomsCount
        const roomsCount = getProperty(data, HOTEL_FIELD_TITLES.roomsCount.prop, HOTEL_FIELD_TITLES.roomsCount.section);
        if (roomsCount) {
            document.querySelectorAll(".book-hotel__moreinfo__rooms_count")
                .forEach(el => el.textContent = roomsCount);
        }

        // internetService (list)
        const internetService = getProperty(
            data,
            HOTEL_FIELD_TITLES.internetService.prop,
            HOTEL_FIELD_TITLES.internetService.section,
            { list: true }
        );
        renderListWithIcon(".book-hotel__moreinfo__internet_service", internetService);

        //airConditioning (list)
        const airConditioning = getProperty(
            data,
            HOTEL_FIELD_TITLES.airConditioning.prop,
            HOTEL_FIELD_TITLES.airConditioning.section,
            { list: true }
        );
        renderListWithIcon(".book-hotel__moreinfo__air_conditioning", airConditioning);

        //disabledFacilities (list)
        const disabledFacilities = getProperty(
            data,
            HOTEL_FIELD_TITLES.disabledFacilities.prop,
            HOTEL_FIELD_TITLES.disabledFacilities.section,
            { list: true }
        );
        renderListWithIcon(".book-hotel__moreinfo__disabled_facilities", disabledFacilities);

        // breakfast (list)
        const breakfast = getProperty(
            data,
            HOTEL_FIELD_TITLES.breakfast.prop,
            HOTEL_FIELD_TITLES.breakfast.section,
            { list: true }
        );
        renderListWithIcon(".book-hotel__moreinfo__breakfast", breakfast);

        // lunch (list)
        const lunch = getProperty(
            data,
            HOTEL_FIELD_TITLES.lunch.prop,
            HOTEL_FIELD_TITLES.lunch.section,
            { list: true }
        );
        renderListWithIcon(".book-hotel__moreinfo__lunch", lunch);

        // dinner (list)
        const dinner = getProperty(
            data,
            HOTEL_FIELD_TITLES.dinner.prop,
            HOTEL_FIELD_TITLES.dinner.section,
            { list: true }
        );
        renderListWithIcon(".book-hotel__moreinfo__dinner", dinner);

        // smoking (list)
        const smoking = getProperty(
            data,
            HOTEL_FIELD_TITLES.smoking.prop,
            HOTEL_FIELD_TITLES.smoking.section,
            { list: true }
        );
        renderListWithIcon(".book-hotel__moreinfo__smoking", smoking);

        // tv (list)
        const tv = getProperty(data, HOTEL_FIELD_TITLES.tv.prop, HOTEL_FIELD_TITLES.tv.section, { list: true });
        renderListWithIcon(".book-hotel__moreinfo__tv", tv);

        // bathroom (list)
        const bathroom = getProperty(data, HOTEL_FIELD_TITLES.bathroom.prop, HOTEL_FIELD_TITLES.bathroom.section, { list: true });
        renderListWithIcon(".book-hotel__moreinfo__bathroom", bathroom);


        // sports (list)
        const sports = getProperty(data, HOTEL_FIELD_TITLES.sports.prop, HOTEL_FIELD_TITLES.sports.section, { list: true });
        renderListWithIcon(".book-hotel__moreinfo__sports", sports);


        // view (single)
        const view = getProperty(data, HOTEL_FIELD_TITLES.view.prop, HOTEL_FIELD_TITLES.view.section);
        if (view) {
            document.querySelectorAll(".book-hotel__moreinfo__view")
                .forEach(el => el.textContent = view);
        }

        // parking (list)
        const parking = getProperty(
            data,
            HOTEL_FIELD_TITLES.parking.prop,
            HOTEL_FIELD_TITLES.parking.section,
            { list: true }
        );

        renderListWithIcon(".book-hotel__moreinfo__parking", parking);

        // beachFacilities (list)
        const beachFacilities = getProperty(
            data,
            HOTEL_FIELD_TITLES.beachFacilities.prop,
            HOTEL_FIELD_TITLES.beachFacilities.section,
            { list: true }
        );
        renderListWithIcon(".book-hotel__moreinfo__beach_facilities", beachFacilities);


        // buildingsCount
        const buildingsCount = getProperty(data, HOTEL_FIELD_TITLES.buildingsCount.prop, HOTEL_FIELD_TITLES.buildingsCount.section);
        if (buildingsCount) {
            document.querySelectorAll(".book-hotel__moreinfo__buildings_count")
                .forEach(el => el.textContent = buildingsCount);
        }

        // buildYear
        const buildYear = getProperty(data, HOTEL_FIELD_TITLES.buildYear.prop, HOTEL_FIELD_TITLES.buildYear.section);
        if (buildYear) {
            document.querySelectorAll(".book-hotel__moreinfo__build_year")
                .forEach(el => el.textContent = buildYear);
        }

        // restaurantsCount
        const restaurantsCount = getProperty(data, HOTEL_FIELD_TITLES.restaurantsCount.prop, HOTEL_FIELD_TITLES.restaurantsCount.section);
        if (restaurantsCount) {
            document.querySelectorAll(".book-hotel__moreinfo__restaurants_count")
                .forEach(el => el.textContent = restaurantsCount);
        }

        // poolOutdoorCount
        const poolOutdoorCount = getProperty(data, HOTEL_FIELD_TITLES.poolOutdoorCount.prop, HOTEL_FIELD_TITLES.poolOutdoorCount.section);
        if (poolOutdoorCount !== null && poolOutdoorCount !== undefined && String(poolOutdoorCount).trim() !== "") {
            document.querySelectorAll(".book-hotel__moreinfo__pool_outdoor_count")
                .forEach(el => el.textContent = poolOutdoorCount);
        }

        // poolIndoorCount
        const poolIndoorCount = getProperty(data, HOTEL_FIELD_TITLES.poolIndoorCount.prop, HOTEL_FIELD_TITLES.poolIndoorCount.section);
        if (poolIndoorCount !== null && poolIndoorCount !== undefined && String(poolIndoorCount).trim() !== "") {
            document.querySelectorAll(".book-hotel__moreinfo__pool_indoor_count")
                .forEach(el => el.textContent = poolIndoorCount);
        }

        // barsCount
        const barsCount = getProperty(data, HOTEL_FIELD_TITLES.barsCount.prop, HOTEL_FIELD_TITLES.barsCount.section);
        if (barsCount !== null && barsCount !== undefined && String(barsCount).trim() !== "") {
            document.querySelectorAll(".book-hotel__moreinfo__bars_count")
                .forEach(el => el.textContent = barsCount);
        }

        // poolBarsCount
        const poolBarsCount = getProperty(data, HOTEL_FIELD_TITLES.poolBarsCount.prop, HOTEL_FIELD_TITLES.poolBarsCount.section);
        if (poolBarsCount !== null && poolBarsCount !== undefined && String(poolBarsCount).trim() !== "") {
            document.querySelectorAll(".book-hotel__moreinfo__pool_bars_count")
                .forEach(el => el.textContent = poolBarsCount);
        }

        // meetingRoomsCount
        const meetingRoomsCount = getProperty(data, HOTEL_FIELD_TITLES.meetingRoomsCount.prop, HOTEL_FIELD_TITLES.meetingRoomsCount.section);
        if (meetingRoomsCount !== null && meetingRoomsCount !== undefined && String(meetingRoomsCount).trim() !== "") {
            document.querySelectorAll(".book-hotel__moreinfo__meeting_rooms_count")
                .forEach(el => el.textContent = meetingRoomsCount);
        }

        // petsMaxWeight
        const petsMaxWeight = getProperty(data, HOTEL_FIELD_TITLES.petsMaxWeight.prop, HOTEL_FIELD_TITLES.petsMaxWeight.section);
        if (petsMaxWeight !== null && petsMaxWeight !== undefined && String(petsMaxWeight).trim() !== "") {
            document.querySelectorAll(".book-hotel__moreinfo__pets_max_weight")
                .forEach(el => el.textContent = petsMaxWeight);
        }

        // petsMaxPerRoom
        const petsMaxPerRoom = getProperty(data, HOTEL_FIELD_TITLES.petsMaxPerRoom.prop, HOTEL_FIELD_TITLES.petsMaxPerRoom.section);
        if (petsMaxPerRoom !== null && petsMaxPerRoom !== undefined && String(petsMaxPerRoom).trim() !== "") {
            document.querySelectorAll(".book-hotel__moreinfo__pets_max_per_room")
                .forEach(el => el.textContent = petsMaxPerRoom);
        }

        // paymentType (list)
        const paymentType = getProperty(data, HOTEL_FIELD_TITLES.paymentType.prop, HOTEL_FIELD_TITLES.paymentType.section, { list: true });
        renderListWithIcon(".book-hotel__moreinfo__payment_type", paymentType);


        // creditCards (list)
        const creditCards = getProperty(data, HOTEL_FIELD_TITLES.creditCards.prop, HOTEL_FIELD_TITLES.creditCards.section, { list: true });
        renderListWithIcon(".book-hotel__moreinfo__credit_cards", creditCards);


        // transportServices (list)
        const transportServices = getProperty(
            data,
            HOTEL_FIELD_TITLES.transportServices.prop,
            HOTEL_FIELD_TITLES.transportServices.section,
            { list: true }
        );
        renderListWithIcon(".book-hotel__moreinfo__transport_services", transportServices);


        // minCheckinAge
        const minCheckinAge = getProperty(data, HOTEL_FIELD_TITLES.minCheckinAge.prop, HOTEL_FIELD_TITLES.minCheckinAge.section);
        if (minCheckinAge !== null && minCheckinAge !== undefined && String(minCheckinAge).trim() !== "") {
            document.querySelectorAll(".book-hotel__moreinfo__min_checkin_age")
                .forEach(el => el.textContent = minCheckinAge);
        }

        // postalCode
        const postalCode = getProperty(data, HOTEL_FIELD_TITLES.postalCode.prop, HOTEL_FIELD_TITLES.postalCode.section);
        if (postalCode) {
            document.querySelectorAll(".book-hotel__moreinfo__postal_code")
                .forEach(el => el.textContent = postalCode);
        }

        // propertyType
        const propertyType = getProperty(data, HOTEL_FIELD_TITLES.propertyType.prop, HOTEL_FIELD_TITLES.propertyType.section);
        if (propertyType) {
            document.querySelectorAll(".book-hotel__moreinfo__property_type")
                .forEach(el => el.textContent = propertyType);
        }

        // cleaning (list)
        const cleaning = getProperty(data, HOTEL_FIELD_TITLES.cleaning.prop, HOTEL_FIELD_TITLES.cleaning.section, { list: true });
        renderListWithIcon(".book-hotel__moreinfo__cleaning", cleaning);


        // staffLanguages (list)
        const staffLanguages = getProperty(data, HOTEL_FIELD_TITLES.staffLanguages.prop, HOTEL_FIELD_TITLES.staffLanguages.section, { list: true });
        renderListWithIcon(".book-hotel__moreinfo__staff_languages", staffLanguages);


        // roomTypes (list)
        const roomTypes = getProperty(data, HOTEL_FIELD_TITLES.roomTypes.prop, HOTEL_FIELD_TITLES.roomTypes.section, { list: true });
        renderListWithIcon(".book-hotel__moreinfo__room_types", roomTypes);


        // bedTypes (list)
        const bedTypes = getProperty(data, HOTEL_FIELD_TITLES.bedTypes.prop, HOTEL_FIELD_TITLES.bedTypes.section, { list: true });
        renderListWithIcon(".book-hotel__moreinfo__bed_types", bedTypes);


        // beautyHygieneServices (list)
        const beautyHygieneServices = getProperty(
            data,
            HOTEL_FIELD_TITLES.beautyHygieneServices.prop,
            HOTEL_FIELD_TITLES.beautyHygieneServices.section,
            { list: true }
        );
        renderListWithIcon(".book-hotel__moreinfo__beauty_hygiene_services", beautyHygieneServices);


        // tvChannels (list)
        const tvChannels = getProperty(data, HOTEL_FIELD_TITLES.tvChannels.prop, HOTEL_FIELD_TITLES.tvChannels.section, { list: true });
        renderListWithIcon(".book-hotel__moreinfo__tv_channels", tvChannels);

        // cafesCount
        const cafesCount = getProperty(data, HOTEL_FIELD_TITLES.cafesCount.prop, HOTEL_FIELD_TITLES.cafesCount.section);
        if (cafesCount !== null && cafesCount !== undefined && String(cafesCount).trim() !== "") {
            document.querySelectorAll(".book-hotel__moreinfo__cafes_count")
                .forEach(el => el.textContent = cafesCount);
        }

        // conferenceHallsCount
        const conferenceHallsCount = getProperty(data, HOTEL_FIELD_TITLES.conferenceHallsCount.prop, HOTEL_FIELD_TITLES.conferenceHallsCount.section);
        if (conferenceHallsCount !== null && conferenceHallsCount !== undefined && String(conferenceHallsCount).trim() !== "") {
            document.querySelectorAll(".book-hotel__moreinfo__conference_halls_count")
                .forEach(el => el.textContent = conferenceHallsCount);
        }

        // roomSize (list)
        const roomSize = getProperty(data, HOTEL_FIELD_TITLES.roomSize.prop, HOTEL_FIELD_TITLES.roomSize.section, { list: true });
        renderListWithIcon(".book-hotel__moreinfo__room_size", roomSize);


        // tennisCourtsCount
        const tennisCourtsCount = getProperty(data, HOTEL_FIELD_TITLES.tennisCourtsCount.prop, HOTEL_FIELD_TITLES.tennisCourtsCount.section);
        if (tennisCourtsCount !== null && tennisCourtsCount !== undefined && String(tennisCourtsCount).trim() !== "") {
            document.querySelectorAll(".book-hotel__moreinfo__tennis_courts_count")
                .forEach(el => el.textContent = tennisCourtsCount);
        }

        function hideEmptyMoreInfoSections() {
            const sections = document.querySelectorAll(".hotel-moreinfo-section");

            sections.forEach((section) => {
                const grids = section.querySelectorAll(".hotel-moreinfo-wrapper");

                grids.forEach((grid) => {
                    const items = Array.from(grid.children);

                    items.forEach((item) => {
                        const valueEl = item.querySelector('span[class*="book-hotel__moreinfo__"]');
                        if (!valueEl) return;

                        const val = (valueEl.textContent || "").trim();

                        if (
                            val === "—" ||
                            val === "" ||
                            val === "-" ||
                            val.toLowerCase() === "n/a"
                        ) {
                            item.style.display = "none";
                        } else {
                            item.style.display = "";
                        }
                    });

                    const hasVisibleItem = Array.from(grid.children).some(
                        (child) => child.style.display !== "none"
                    );
                    grid.style.display = hasVisibleItem ? "" : "none";
                });

                const hasAnyVisibleGrid = Array.from(
                    section.querySelectorAll(".hotel-moreinfo-grid")
                ).some((g) => g.style.display !== "none");

                section.style.display = hasAnyVisibleGrid ? "" : "none";
            });

            const hasAnyVisibleSection = Array.from(
                document.querySelectorAll(".hotel-moreinfo-section")
            ).some((sec) => sec.style.display !== "none");

            const moreInfoBtn = document.querySelector(".open-hotel-moreinfo-btn");
            if (moreInfoBtn) {
                if (!hasAnyVisibleSection) {
                    moreInfoBtn.classList.add("book-hidden");
                    moreInfoBtn.classList.remove("book-flex");
                } else {
                    moreInfoBtn.classList.remove("book-hidden");
                    moreInfoBtn.classList.add("book-flex");
                }
            }
        }
        hideEmptyMoreInfoSections();

        if (window.innerWidth < 1024) {
            const hotelContents = document.querySelectorAll(".book-hotel__content");
            const hotelLoaders = document.querySelectorAll(".hotel-content-loader");

            hotelLoaders.forEach((loader) => {
                loader.classList.add("book-hidden");
            });

            hotelContents.forEach((content) => {
                content.classList.remove("book-hidden");
            });
        } else {
            const hotelInfoContent = document.querySelector(".book-hotel__content");
            const hotelContentWrapperLoader = document.querySelector(".hotel-content-wrapper-loader");

            if (hotelContentWrapperLoader) {
                hotelContentWrapperLoader.classList.remove("book-flex");
                hotelContentWrapperLoader.classList.add("book-hidden");
            }
            if (hotelInfoContent) {
                hotelInfoContent.classList.remove("book-hidden");
            }
        }

    } catch (error) {
        console.error("setInfo error:", error);
        console.error("stack:", error?.stack);
        return '';
    }
};

const renderAvailableRooms = async (element) => {
    try {
        // --- language detect (fa vs en) ---
        const formEl = document.querySelector("form[lang], form#hotelSearch") || null;
        const lang = (
            formEl?.getAttribute("lang") ||
            document.documentElement.getAttribute("lang") ||
            ""
        ).toLowerCase();
        const dir = (
            formEl?.getAttribute("dir") ||
            document.documentElement.getAttribute("dir") ||
            ""
        ).toLowerCase();
        const isFa = lang.startsWith("fa") || lang.startsWith("ar") || dir === "rtl";

        const TXT = isFa
            ? {
                noRooms: "هیچ اتاقی برای نمایش موجود نیست. لطفاً فیلترها را تغییر دهید یا دوباره تلاش کنید.",
                roomRules: "قوانین اتاق",
            }
            : {
                noRooms: "No rooms available to display. Please adjust filters or try again.",
                roomRules: "Room rules",
            };

        if (
            !element ||
            !Array.isArray(element.availablerooms) ||
            element.availablerooms.length === 0 ||
            (element.msg && element.msg === "no data")
        ) {
            const sectionRooms = document.querySelector("#section-rooms");

            if (sectionRooms) {
                sectionRooms.insertAdjacentHTML(
                    "afterend",
                    `
  <div class="book-text-zinc-900 book-text-sm book-mt-4">
    ${TXT.noRooms}
  </div>
`
                );
            }
            return;
        }

        const serviceLabel = element.services;

        const { currency_cost_number, floatdigit } = getCurrencyUnitFromStorage();
        const currency_unit = renderUnit("");

        const roomsHtml = element.availablerooms
            .map((room, index) => {
                const info = room.info || {};
                const roomName = info.room || "";
                const availability = info.availability || "";
                const availabilityLabel = availability
                    ? availability.charAt(0).toUpperCase() + availability.slice(1)
                    : "";

                const paddingClass = index > 0 ? " book-pt-6" : "";

                const hiddenInputs = `
  ${renderOptionId(element)}
  ${renderadults(element)}
  ${renderchildwithbed(element)}
  ${renderchildwithoutbed(element)}
  ${renderinfant(element)}
  ${renderroomid(element)}
  ${renderid(element)} 
  ${renderproviderId(element)} 
  ${renderprovider(element)} 
  ${renderhotelidRooms(element)}
  ${rendernightsRooms(element)} 
  ${rendersupplierRooms(element)} 
  <input type="hidden" value="${currency_unit}" name="rate-unit" class="rate-unit" /> 
  <input type="hidden" value="${currency_cost_number}" name="rate-cost" class="rate-cost" /> 
  <input type="hidden" value="${floatdigit}" name="rate-floatdigit" class="rate-floatdigit" /> 
  <input type="hidden" value="[##cms.form.sid|(2)##]" name="sid" />
  <input type="hidden" value="[##cms.form.Hotel-Date|(0)##]" name="Hotel-Date" />
  <input type="hidden" value="[##cms.form.cityid##]" name="cityid" /> 
  <input type="hidden" value="[##cms.form.coHotel##]" name="coHotel" /> 
  <input type="hidden" value='[##cms.json.header|cms.form.roomSearch##]' name="roomSearch" /> 
  <input type="hidden" value="[##cms.form.fdate##]" name="fdate" /> 
  <input type="hidden" value="[##cms.form.tdate##]" name="tdate" /> 
`;

                setActionForAllForms();

                return `
  <div class="${paddingClass}">
    <h3 class="book-text-zinc-900 book-mb-3">${roomName}</h3>

    <div class="book-flex book-items-center book-gap-2">
      <span class="book-bg-primary-50 book-text-primary-800 book-text-xs book-rounded-3xl book-py-1 book-px-3">
        ${serviceLabel}
      </span>

      <span class="book-bg-specialcolor-1 book-text-specialcolor-2 book-text-xs book-rounded-3xl book-py-1 book-px-4">
        ${availabilityLabel}
      </span>

      <button
        type="button"
        class="book-inline-flex book-items-center book-gap-1 book-text-blue-600 book-text-xs book-rounded-3xl book-py-1 book-px-3 hover:book-bg-blue-50 book-transition"
        onclick="showRules(this,'${element.optionId}')"
      >
        <svg width="48" height="48">
          <use href="/booking/images/sprite-hotelDetails-icons.svg#icon-document"></use>
        </svg>
        ${TXT.roomRules}
      </button>
    </div>

    ${hiddenInputs}
  </div>
`;
            })
            .join("");

        return `
<div class="book-flex-[2.3] book-flex book-flex-col book-justify-center book-gap-6 book-divide-y book-divide-dashed book-divide-zinc-300">
${roomsHtml}
</div>
`;
    } catch (error) {
        console.error(`renderAvailableRooms: ${error.message}`);
        return "";
    }
};

const renderAvailableRoomsMobile = async (element) => {
    try {
        if (!element || !Array.isArray(element.availablerooms)) {
            console.warn("⚠️ renderAvailableRoomsMobile: no availablerooms found");
            return "";
        }

        const serviceLabel = element.services || "";

        const { currency_cost_number, floatdigit } = getCurrencyUnitFromStorage();
        const currency_unit = renderUnit("");

        const roomsHtml = element.availablerooms
            .map((room, index) => {
                const info = room.info || {};
                const roomName = info.room || "";
                const availability = info.availability || "";
                const availabilityLabel = availability
                    ? availability.charAt(0).toUpperCase() + availability.slice(1)
                    : "";

                const paddingClass = index > 0 ? " book-pt-6" : "";

                const hiddenInputs = `
            ${renderOptionId(element)}
            ${renderadults(element)}
            ${renderchildwithbed(element)}
            ${renderchildwithoutbed(element)}
            ${renderinfant(element)}
            ${renderroomid(element)}
            ${renderid(element)} 
            ${renderproviderId(element)} 
            ${renderprovider(element)} 
            ${renderhotelidRooms(element)}
            ${rendernightsRooms(element)} 
            ${rendersupplierRooms(element)} 
            <input type="hidden" value="${currency_unit}" name="rate-unit" class="rate-unit" /> 
            <input type="hidden" value="${currency_cost_number}" name="rate-cost" class="rate-cost" /> 
            <input type="hidden" value="${floatdigit}" name="rate-floatdigit" class="rate-floatdigit" /> 
            <input type="hidden" value="[##cms.form.sid|(2)##]" name="sid" />
            <input type="hidden" value="[##cms.form.Hotel-Date|(0)##]" name="Hotel-Date" />
            <input type="hidden" value="[##cms.form.cityid##]" name="cityid" /> 
            <input type="hidden" value="[##cms.form.coHotel##]" name="coHotel" /> 
            <input type="hidden" value='[##cms.json.header|cms.form.roomSearch##]' name="roomSearch" /> 
            <input type="hidden" value="[##cms.form.fdate##]" name="fdate" /> 
            <input type="hidden" value="[##cms.form.tdate##]" name="tdate" /> 
        `;

                return `
            <div class="${paddingClass}">
                <h3 class="book-text-xs book-text-zinc-900 book-mb-4">${roomName}</h3>
                <div class="book-flex book-gap-2">
                    <span class="book-bg-primary-50 book-text-primary-800 book-text-xs book-rounded-3xl book-py-1 book-px-3">${serviceLabel}</span>
                    <span class="book-bg-specialcolor-1 book-text-specialcolor-2 book-text-xs book-rounded-3xl book-py-1 book-px-4">${availabilityLabel}</span>
                </div>
                ${hiddenInputs}
            </div>
        `;
            })
            .join("");

        return `
    <div class="book-flex book-flex-col book-gap-6 book-divide-y book-divide-dashed book-divide-zinc-300">
        ${roomsHtml}
    </div>
`;
    } catch (error) {
        console.error(`renderAvailableRoomsMobile: ${error.message}`);
        return "";
    }
};

const renderAction = (element) => {
    let type_module = '[##cms.form.type_module|cms.form.key##]';
    let clid = '[##cms.form.clid|(1)##]';
    if (clid == 1) {
        return "/Client_Show_Hotel_ver.2.bc"
    } else if (clid == 2) {
        return "/Client_Show_Hotel_En_ver.2.bc"
    } else if (clid == 3) {
        return "/Client_Show_Hotel_Ar_ver.2.bc"
    }
};

const setActionForAllForms = () => {
    const roomFormContainer = document.querySelector('.book-list__cards__container');

    if (!roomFormContainer) {
        console.warn('⚠️ book-list__cards__container not found!');
        return;
    }

    const roomForms = roomFormContainer.querySelectorAll('.book-hotel__room');

    roomForms.forEach(form => {
        const formAction = renderAction();
        form.setAttribute('action', formAction);
    });
};

const roomMutationObserver = new MutationObserver(() => {
    const roomFormContainer = document.querySelector('.book-list__cards__container');

    if (roomFormContainer) {
        setActionForAllForms();
        roomMutationObserver.disconnect();
    }
});

roomMutationObserver.observe(document.body, { childList: true, subtree: true });


function renderOptionId(element) {
    let optionId = element.optionId;

    if (typeof optionId === 'string') {
        return `<input type="hidden" value="${optionId}" name="optionId" />`;
    } else if (typeof optionId === 'object' && optionId !== null) {
        return `<input type="hidden" value="${optionId.someProperty}" name="optionId" />`;
    }

    return '';
}
function renderUnit(currency_unit) {
    if (currency_unit === '') {
        let moneytype = '[##cms.form.moneytype##]';
        return moneytype;
    } else {
        return currency_unit;
    }
}
function renderadults(element) {
    let lenavailablerooms = element.availablerooms.length;
    let indents = [];

    for (let i = 0; i < lenavailablerooms; i++) {
        let adults = element.availablerooms[i].info.adults;
        if (typeof adults === 'number') {
            indents.push(`<input type="hidden" name="_root.rooms__${i}.adults" value="${adults}" />`);
        } else if (Array.isArray(adults)) {
            adults.forEach(adult => {
                indents.push(`<input type="hidden" name="_root.rooms__${i}.adults" value="${adult}" />`);
            });
        } else if (typeof adults === 'string') {

            const adultsList = adults
                .split(',')
                .map(a => a.trim())
                .filter(a => a !== '');

            adultsList.forEach(adult => {
                indents.push(
                    `<input type="hidden" name="_root.rooms__${i}.adults" value="${adult}" />`
                );
            });
        }
    }

    return indents.join('');
}

function renderchildwithbed(element) {
    let lenavailablerooms = element.availablerooms.length;
    let indents = [];

    for (let i = 0; i < lenavailablerooms; i++) {
        let withbed = element.availablerooms[i].info.withbed;

        if (typeof withbed === 'number') {
            indents.push(`<input type="hidden" name="_root.rooms__${i}.childwithbed" value="${withbed}" />`);
        } else if (Array.isArray(withbed)) {
            withbed.forEach(bed => {
                indents.push(`<input type="hidden" name="_root.rooms__${i}.childwithbed" value="${bed}" />`);
            });
        }
    }

    return indents.join('');
}


function renderchildwithoutbed(element) {
    let lenavailablerooms = element.availablerooms.length;
    let indents = [];

    for (let i = 0; i < lenavailablerooms; i++) {
        let withoutbed = element.availablerooms[i].info.withoutbed;

        if (typeof withoutbed === 'number') {
            indents.push(`<input type="hidden" name="_root.rooms__${i}.childwithoutbed" value="${withoutbed}" />`);
        } else if (Array.isArray(withoutbed)) {
            withoutbed.forEach(bed => {
                indents.push(`<input type="hidden" name="_root.rooms__${i}.childwithoutbed" value="${bed}" />`);
            });
        }
    }

    return indents.join('');
}


function renderinfant(element) {
    let lenavailablerooms = element.availablerooms.length;
    let indents = [];

    for (let i = 0; i < lenavailablerooms; i++) {
        let infant = element.availablerooms[i].info.infant;

        if (typeof infant === 'number') {
            indents.push(`<input type="hidden" name="_root.rooms__${i}.infant" value="${infant}" />`);
        } else if (Array.isArray(infant)) {
            infant.forEach(child => {
                indents.push(`<input type="hidden" name="_root.rooms__${i}.infant" value="${child}" />`);
            });
        }
    }

    return indents.join('');
}

function renderroomid(element) {
    let lenavailablerooms = element.availablerooms.length;
    let indents = [];

    for (let i = 0; i < lenavailablerooms; i++) {
        let roomid = element.availablerooms[i].info.roomid;

        if (typeof roomid === 'string' || typeof roomid === 'number') {
            indents.push(`<input type="hidden" name="_root.rooms__${i}.roomid" value="${roomid}" />`);
        }
    }

    return indents.join('');
}

function renderid(element) {
    let id = element.id;

    if (typeof id === 'string') {
        return `<input type="hidden" value="${id}" name="productid" />`;
    } else if (typeof id === 'object' && id !== null) {
        return `<input type="hidden" value="${id.hotelId}" name="productid" />`;
    }

    return '';
}


function renderproviderId(element) {
    let provider = element.id.provider;

    let providerId = (provider && provider.provider_id) || '0';

    return `<input type="hidden" name="provider" class="provider" value="${providerId}" />`;
}

function renderprovider(element) {
    let provider = element.id.provider;

    if (provider === undefined) {
        return '';
    } else {
        return `<input type="hidden" name="mainprovider" value='${JSON.stringify(provider)}' />`;
    }
}

function renderhotelidRooms(element) {
    let hotelIdFamily = element.id.hotelId;

    if (hotelIdFamily === undefined) {
        return `<input type="hidden" value="${element.hotelid}" name="hotelid" />`;
    } else {
        return `<input type="hidden" value="${hotelIdFamily}" name="hotelid" />`;
    }
}


function rendernightsRooms(element) {
    let nights = element.nights;

    return `<input type="hidden" name="nightLink" value="${nights}" />`;
}
function rendersupplierRooms(element) {
    let supplier = element.supplier;

    return `<input type="hidden" name="supplier" value="${supplier}" />`;
}



const getCurrencyUnitFromStorage = (key = 'currencyObject') => {
    const EMPTY = {
        currency_unit: '',
        currency_cost: '',
        currency_cost_number: '',
        floatdigit: '',
    };

    try {
        if (typeof localStorage === 'undefined') return EMPTY;
        const raw = localStorage.getItem(key);
        if (!raw) return EMPTY;

        let obj;
        try {
            obj = JSON.parse(raw);
        } catch {
            return EMPTY; // invalid JSON
        }
        if (!obj || typeof obj !== 'object') return EMPTY;

        // TTL validation (expire/time)
        const time = Number.isFinite(+obj.time) ? +obj.time : null;
        const expire = Number.isFinite(+obj.expire) ? +obj.expire : null;
        const isExpired = (time !== null && expire !== null) && (Date.now() - time > expire);
        if (isExpired) return EMPTY;

        // currency_unit
        const currency_unit =
            typeof obj.currency_unit === 'string' ? obj.currency_unit.trim() : null;

        // currency_cost (raw) + numeric version
        const currency_cost =
            (typeof obj.currency_cost === 'string' || typeof obj.currency_cost === 'number')
                ? obj.currency_cost
                : null;

        let currency_cost_number = null;
        if (currency_cost != null) {
            const sanitized = String(currency_cost).replace(/[^\d.-]/g, '');
            const num = Number(sanitized);
            currency_cost_number = Number.isFinite(num) ? num : null;
        }

        // floatdigit
        const floatdigit =
            Number.isFinite(+obj.floatdigit) ? parseInt(obj.floatdigit, 10) : null;

        return { currency_unit, currency_cost, currency_cost_number, floatdigit };
    } catch (err) {
        console.error('getCurrencyUnitFromStorage error:', err);
        return {
            currency_unit: null,
            currency_cost: null,
            currency_cost_number: null,
            floatdigit: null,
        };
    }
};
const priceWithCurrency = (amount, opts = {}) => {
try {
const a = Number(amount);
if (!Number.isFinite(a)) return opts.as === 'number' ? 0 : '0';

// language & direction detection
const lang = (
    document.documentElement.getAttribute("lang") || ""
).toLowerCase();

const dir = (
    opts.formEl?.getAttribute("dir") ||
    document.documentElement.getAttribute("dir") ||
    ""
).toLowerCase();

const isFa = lang.startsWith("fa") || lang.startsWith("ar") || dir === "rtl";

// texts
const texts = {
    basePrice: isFa ? "مبلغ اصلی:" : "Base Price:",
    commission: isFa ? "کمیسیون:" : "Commission:",
    payable: isFa ? "مبلغ قابل پرداخت:" : "Payable Amount:"
};

const { currency_cost_number, floatdigit, currency_unit } =
    getCurrencyUnitFromStorage();

const unit =
    currency_unit && String(currency_unit).trim()
        ? String(currency_unit).trim()
        : isFa ? "ریال" : "IRR";

const rate = Number.isFinite(opts.rate)
    ? Number(opts.rate)
    : Number.isFinite(currency_cost_number)
        ? currency_cost_number
        : 1;

let x = a * rate;

// Apply floatdigit
if (floatdigit !== null && floatdigit !== undefined && floatdigit !== '') {
    if (floatdigit >= 0) {
        const toString_x = x.toString();
        if (toString_x.includes('.')) {
            const fixed = x.toFixed(floatdigit);
            const parts = fixed.split('.');
            if (parts[1] && /^0+$/.test(parts[1])) {
                x = parseFloat(x.toFixed(1));
            } else {
                x = parseFloat(fixed);
            }
        } else {
            x = parseFloat(x.toFixed(floatdigit));
        }
    } else {
        const multiplier = Math.pow(10, Math.abs(floatdigit));
        x = Math.round(x / multiplier) * multiplier;
    }
}

const commission = opts.commission || 0;
const payableAmount = commission > 0 ? a - commission : a;

if (opts.as === 'number') return x;

const useGrouping = opts.group !== false;
const hasDigits = floatdigit !== null && floatdigit !== undefined && floatdigit !== '';

const nf = new Intl.NumberFormat(opts.locale || undefined,
    hasDigits && floatdigit >= 0
        ? {
            minimumFractionDigits: opts.fixed ? Math.max(0, floatdigit) : 0,
            maximumFractionDigits: Math.max(0, floatdigit),
            useGrouping
        }
        : { useGrouping }
);

const formattedPrice = nf.format(x);
const formattedPayable = nf.format(payableAmount);

const commissionLabel = commission > 0
    ? `
    <div class="commission-text book-flex book-items-center book-gap-1 book-text-red-600 book-text-xs">
        ${texts.commission}
        <span class="book-text-zinc-900 book-font-bold book-text-xl">
            ${nf.format(commission)}
        </span>
        <span class="book-text-zinc-500 book-text-xs book-font-normal">
            ${unit}
        </span>
    </div>`
    : '';

return `
<div class="book-flex book-flex-col book-gap-1 book-items-center ${window.innerWidth < 1024 ? 'book-mt-6' : ''}">
    <div class="book-flex book-items-center book-gap-1" data-original-price="${amount}">
        <h3 class="book-text-xs book-text-zinc-900">${texts.basePrice}</h3>
        <div class="price-unit-container book-flex book-items-center book-gap-1">
            <span class="book-price__check__currency book-text-zinc-900 book-font-bold book-text-xl">
                ${formattedPrice}
            </span>
            <span class="book-unit__check__currency book-text-zinc-500 book-text-xs book-font-normal">
                ${unit}
            </span>
        </div>
    </div>

    ${commissionLabel}

    ${commission > 0 ? `
    <div class="book-flex book-items-center book-gap-1">
        <span class="book-text-zinc-900 book-text-xs">${texts.payable}</span>
        <span class="book-price__check__currency book-text-zinc-900 book-font-bold book-text-xl">
            ${formattedPayable}
        </span>
        <span class="book-unit__check__currency book-text-zinc-500 book-text-xs book-font-normal">
            ${unit}
        </span>
    </div>` : ''}
</div>
`;
} catch {
return opts.as === 'number' ? 0 : '0';
}
};



/**
 * Global state for hotel room filtering, sorting, and pagination
 */

let allHotelFamilies = [];
let originalHotelFamilies = [];
let mustUpdate = true;
let newDataCame = false;
let InUpdateUIProcess = false;
let InUpdatePaging = true;
let InUpdateFiltering = true;
let allDataProcessed = false;
let currentSort = { value: "price", order: "ascend" };
let selectedRoomTypes = [];
let selectedServices = [];


/**
 * Main function to process hotel data, handle filtering, sorting, and pagination
 * @param {Object} args - Input arguments containing source data and context
 * @returns {void}
 */
const manipulation = async (args) => {
    // ============= INITIALIZATION =============
    let currentIndex = 0;
    let start = 0;
    let end = 2; // نمایش 10 اتاق در هر صفحه
    let dynamicRoomCount = 0;
    // ============= PAGINATION HANDLERS =============
    if (args.source.id === 'cms.page') {
        mustUpdate = true;
        InUpdatePaging = false;
        InUpdateFiltering = false;

        const selectedPage = parseInt(args.source.rows[0].value);

        let currentValue = selectedPage - 1;
        const prevButton = document.querySelector(".book-prevpage");
        const nextButton = document.querySelector(".book-nextpage");
        const pagingContainer = document.querySelector(".book-paging__cards__container");

        const totalPages = Math.ceil(pagingContainer.children.length - 2);

        // Update active page styling
        const activeButton = document.querySelector(".book-active__paging");
        if (activeButton) {
            activeButton.classList.remove("book-active__paging");
            activeButton.classList.remove("book-bg-primary-50");
            activeButton.classList.remove("book-text-primary-800");
            activeButton.classList.add("book-bg-zinc-100");
            activeButton.classList.add("book-text-zinc-900");
        }

        const newActive = pagingContainer.querySelector(`[bc-value="${selectedPage}"]`);
        if (newActive) {
            newActive.classList.add("book-active__paging");
            newActive.classList.add("book-bg-primary-50");
            newActive.classList.add("book-text-primary-800");
            newActive.classList.remove("book-bg-zinc-100");
            newActive.classList.remove("book-text-zinc-900");
        }

        // Calculate pagination range
        start = currentValue * 2;
        end = start + 2;

        // Toggle previous button visibility based on current page and total pages
        if (prevButton) {
            prevButton.classList.toggle("book-hidden", selectedPage <= 1); // Hide prev if it's on the first page
        }

        // Toggle next button visibility based on current page and total pages
        if (nextButton) {
            nextButton.classList.toggle("book-hidden", selectedPage >= totalPages); // Hide next if it's on the last page
        }

    } else if (args.source.id === 'cms.nextpage') {

        mustUpdate = true;
        InUpdatePaging = false;
        InUpdateFiltering = false;

        const prevButton = document.querySelector(".book-prevpage");
        const nextButton = document.querySelector(".book-nextpage");
        const activeButton = document.querySelector(".book-active__paging");
        const selectedPage = parseInt(activeButton.getAttribute("bc-value"));
        const pagingContainer = document.querySelector(".book-paging__cards__container");
        const nextValue = selectedPage + 1;
        const nextPage = document.querySelector(`.book-paging__cards__container [bc-value="${nextValue}"]`);
        const totalPages = Math.ceil(pagingContainer.children.length - 2);

        if (nextPage) {
            // Update active page styling
            activeButton.classList.remove("book-active__paging");
            activeButton.classList.remove("book-bg-primary-50");
            activeButton.classList.remove("book-text-primary-800");
            activeButton.classList.add("book-bg-zinc-100");
            activeButton.classList.add("book-text-zinc-900");

            nextPage.classList.add("book-active__paging");
            nextPage.classList.remove("book-text-zinc-900");
            nextPage.classList.remove("book-bg-zinc-100");
            nextPage.classList.add("book-bg-primary-50");
            nextPage.classList.add("book-text-primary-800");

            // Show next page if hidden
            if (nextPage.classList.contains("book-hidden")) {
                nextPage.classList.remove("book-hidden");
                const firstVisible = document.querySelector(".book-paging__cards__container:not(.hidden):not(.book-prevpage):not(.book-nextpage)");
                if (firstVisible) firstVisible.classList.add("book-hidden");
            }

            // Show previous button if not on first page
            if (nextButton) {
                if (nextValue >= totalPages) {
                    nextButton.classList.add("book-hidden"); // Hide next if we're on the last page
                } else {
                    nextButton.classList.remove("book-hidden"); // Show next if we're not on the last page
                }
            }
            if (prevButton) {
                prevButton.classList.toggle("book-hidden", nextValue === 1);
            }
        }

        start = selectedPage * 2;
        end = start + 2;

    } else if (args.source.id === 'cms.prevpage') {
        mustUpdate = true;
        InUpdatePaging = false;
        InUpdateFiltering = false;

        const prevButton = document.querySelector(".book-prevpage");
        const nextButton = document.querySelector(".book-nextpage");
        const activeButton = document.querySelector(".book-active__paging");
        const selectedPage = parseInt(activeButton.getAttribute("bc-value"));
        const prevValue = selectedPage - 1;
        const prevPage = document.querySelector(`.book-paging__cards__container [bc-value="${prevValue}"]`);

        if (prevPage) {
            // Update active page styling
            activeButton.classList.remove("book-active__paging");
            activeButton.classList.remove("book-bg-primary-50");
            activeButton.classList.remove("book-text-primary-800");
            activeButton.classList.add("book-bg-zinc-100");
            activeButton.classList.add("book-text-zinc-900");

            // Add active class and update styles for the new active button (prevPage)
            prevPage.classList.add("book-active__paging");
            prevPage.classList.remove("book-text-zinc-900");
            prevPage.classList.remove("book-bg-zinc-100");
            prevPage.classList.add("book-bg-primary-50");
            prevPage.classList.add("book-text-primary-800");

            // Show previous page if hidden
            if (prevPage.classList.contains("book-hidden")) {
                prevPage.classList.remove("book-hidden");
                const allButtons = Array.from(document.querySelectorAll(".book-paging__cards__container:not(.book-prevpage):not(.book-nextpage)"));
                const lastVisible = allButtons.reverse().find(btn => !btn.classList.contains("book-hidden"));
                if (lastVisible) lastVisible.classList.add("book-hidden");
            }

            // Toggle previous and next button visibility
            if (prevButton) {
                prevButton.classList.toggle("book-hidden", prevValue === 1);
            }
            if (nextButton) {
                nextButton.classList.remove("book-hidden");
            }
        }

        // Update pagination range
        start = prevValue * 2;
        end = start + 2;
    } else if (args.source.id === "room.list") {
        newDataCame = true;
        allDataProcessed = false;
    } else if (args.source.id === 'cms.roomtypes') {
        mustUpdate = true;
        InUpdatePaging = true;
        InUpdateFiltering = false;

        // چک کردن ساختار rows
        let searchText = '';
        if (args.source.rows && args.source.rows.length > 0) {
            // اگر rows آرایه‌ای از آبجکت‌ها بود
            if (args.source.rows[0].value !== undefined) {
                searchText = args.source.rows[0].value;
            }
            // اگر خود rows یک آرایه ساده بود
            else if (typeof args.source.rows[0] === 'string') {
                searchText = args.source.rows[0];
            }
        }

        // اگر متنی تایپ شده، فیلتر کن
        if (searchText && searchText.trim()) {
            selectedRoomTypes = [searchText.trim()];
        } else {
            selectedRoomTypes = [];
        }

    } else if (args.source.id === 'cms.services') {
        mustUpdate = true;
        InUpdatePaging = true;
        InUpdateFiltering = false;

        // دریافت متن تایپ شده برای جستجو
        const searchText = args.source.rows[0]?.value || '';

        // اگر متنی تایپ شده، فیلتر کن
        if (searchText && searchText.trim()) {
            selectedServices = [searchText.trim()];
        } else {
            selectedServices = [];
        }
    }

    // ============= UI UPDATE PROCESS =============
    if (mustUpdate && !InUpdateUIProcess) {
        InUpdateUIProcess = true;

        // Collect new hotel families and reset for new searches
        if (newDataCame) {
            const source = args.context.tryToGetSource("room.list");

            // Reset data for new searches
            if (source.rows[0]?.isNewSearch) {
                allHotelFamilies = [];
            }

            source.rows.forEach(row => {
                if (Array.isArray(row.families)) {
                    allHotelFamilies.push(...row.families);
                    originalHotelFamilies = [...allHotelFamilies];
                }
            });

            newDataCame = false;
            allDataProcessed = true;
        }

        // ============= SORTING LOGIC =============
        if (allDataProcessed) {
            // Sort newSource if we have filtered data, otherwise sort all
            const sourceToSort = (selectedRoomTypes.length > 0 || selectedServices.length > 0)
                ? [...allHotelFamilies]
                : allHotelFamilies;

            sourceToSort.sort((a, b) => {
                const priceA = a.totalPrice ? parseFloat(a.totalPrice) : Infinity;
                const priceB = b.totalPrice ? parseFloat(b.totalPrice) : Infinity;

                if (currentSort.order === "ascend") {
                    return priceA - priceB;
                } else {
                    return priceB - priceA;
                }
            });

            // Update allHotelFamilies with sorted data
            if (selectedRoomTypes.length === 0 && selectedServices.length === 0) {
                allHotelFamilies = sourceToSort;
            }
        }


        const filters = [
            // فیلتر براساس نام اتاق (جستجو با includes)
            item => {
                if (!selectedRoomTypes.length) return true;
                const searchTerm = selectedRoomTypes[0].toLowerCase();
                const hasMatch = item.availablerooms.some(room => {
                    const roomName = room.info.room || '';
                    return roomName.toLowerCase().includes(searchTerm);
                });
                return hasMatch;
            },
            // فیلتر براساس خدمات (جستجو با includes)
            item => {
                if (!selectedServices.length) return true;
                const searchTerm = selectedServices[0].toLowerCase();
                return item.services && item.services.toLowerCase().includes(searchTerm);
            }
        ];

        // Filter hotel families
        const newSource = allHotelFamilies.filter(item =>
            filters.every(filter => filter(item))
        );

        // Update room count display

        dynamicRoomCount = newSource.length;
        const countElement = document.querySelector(".book-count__api__content");
        if (countElement) {
            countElement.textContent = dynamicRoomCount;
        }

        // Add index to each item
        const indexedSource = newSource.map((item, i) => ({
            ...item,
            index: currentIndex + i
        }));
        currentIndex += newSource.length;

        // Apply pagination
        const pagedSource = indexedSource.slice(start, end);

        // ============= UI UPDATE LOGIC =============
        if (newSource.length > 0) {
            // Update price range - استفاده از newSource به جای allHotelFamilies
            const pricesSource = newSource
                .map(item => item.totalPrice ? parseFloat(item.totalPrice) : null)
                .filter(Boolean);


            // Update pagination UI
            if (InUpdatePaging) {
                const container = document.querySelector(".book-paging__cards__container");
                if (container) {
                    const nextPage = container.querySelector(".book-nextpage");
                    const prevPage = container.querySelector(".book-prevpage");

                    if (prevPage) {
                        prevPage.classList.add("book-hidden");
                    }

                    const roundedNumber = Math.ceil(currentIndex / 2);
                    const activePage = 0;

                    const arrayPaging = Array.from({ length: roundedNumber }, (_, i) => ({
                        index: i,
                        page: i + 1,
                        isActive: i === activePage,
                        isVisible: true
                    }));
                    if (nextPage) {
                        nextPage.classList.toggle("book-hidden", arrayPaging.length <= 1);
                    }

                    args.context.setAsSource("hotel.paging", arrayPaging);
                }
            }

            // ============= FILTER UPDATE LOGIC =============
            if (InUpdateFiltering) {
                const filteringSource = allHotelFamilies;

                // استخراج نام اتاق‌های یونیک
                const allRoomTypes = [];
                filteringSource.forEach(item => {
                    item.availablerooms.forEach(room => {
                        if (room.info.room) {
                            allRoomTypes.push({
                                name: room.info.room,
                                price: item.totalPrice || 0
                            });
                        }
                    });
                });

                // حذف تکراری‌ها و انتخاب ارزان‌ترین قیمت برای هر نوع اتاق
                const roomTypeMap = {};
                allRoomTypes.forEach(room => {
                    if (!roomTypeMap[room.name] || roomTypeMap[room.name].price > room.price) {
                        roomTypeMap[room.name] = room;
                    }
                });

                const uniqueRoomTypes = Object.values(roomTypeMap)
                    .sort((a, b) => a.price - b.price)
                    .map(room => ({ Name: room.name }));

                args.context.setAsSource("hotel.roomtypes", uniqueRoomTypes);

                // استخراج خدمات یونیک
                const allServices = filteringSource
                    .map(item => ({ Name: item.services }))
                    .filter(item => item.Name);

                const uniqueServices = allServices.filter((item, index, self) =>
                    index === self.findIndex(t => t.Name === item.Name)
                );

                args.context.setAsSource("hotel.services", uniqueServices);
            }

            // Update hotel list
            args.context.setAsSource("hotel.updated", pagedSource, { keyFieldName: "optionId" });
            InUpdateUIProcess = false;

        } else {
            // ============= NO RESULTS HANDLING =============
            InUpdateUIProcess = false;

            // --- language detect (fa vs en) ---
            const formEl = args?.context?.element
                ? args.context.element.closest("form")
                : null;

            const lang = (
                formEl?.getAttribute("lang") ||
                document.documentElement.getAttribute("lang") ||
                ""
            ).toLowerCase();

            const dir = (
                formEl?.getAttribute("dir") ||
                document.documentElement.getAttribute("dir") ||
                ""
            ).toLowerCase();

            const isFa = lang.startsWith("fa") || lang.startsWith("ar") || dir === "rtl";

            const TXT = isFa
                ? {
                    title: "هیچ اتاقی با فیلترهای انتخابی یافت نشد",
                    subtitle: "لطفاً فیلترها را تغییر دهید",
                    fallback: "هیچ اتاقی برای نمایش موجود نیست. لطفاً دوباره تلاش کنید.",
                }
                : {
                    title: "No rooms match your selected filters",
                    subtitle: "Please adjust your filters",
                    fallback: "No rooms are available to display. Please try again.",
                };

            // Display no rooms found message
            const listContainer = document.querySelector(".book-list__cards__container");
            if (listContainer) {
                listContainer.innerHTML = `
<div class="book-text-center">
<div>${TXT.title}</div>
<div class="book-text-zinc-900 book-text-xs book-mt-2">${TXT.subtitle}</div>
</div>
`;
            } else {
                const sectionRooms = document.querySelector("#section-rooms");
                if (sectionRooms) {
                    sectionRooms.insertAdjacentHTML(
                        "afterend",
                        `
<div class="book-text-zinc-900 book-text-sm book-mt-4">
  ${TXT.fallback}
</div>
`
                    );
                }
            }

            // Hide pagination controls when no results
            const container = document.querySelector(".book-paging__cards__container");
            if (container) {
                const buttons = container.querySelectorAll(
                    ".book-paging__container:not(.book-nextpage):not(.book-prevpage)"
                );
                const nextPage = container.querySelector(".book-nextpage");
                const prevPage = container.querySelector(".book-prevpage");

                if (prevPage) prevPage.classList.add("book-hidden");
                if (nextPage) nextPage.classList.add("book-hidden");
                buttons.forEach((button) => button.remove());
            }
        }
    }
};

const renderPaging = async (element) => {
    try {
        const pagingContainer = document.querySelector(".book-paging__cards__container");
        const { index, page, isActive, isVisible } = element;
        const nextPage = pagingContainer?.querySelector(".book-nextpage");
        const prevPage = pagingContainer?.querySelector(".book-prevpage");

        const totalPages = Math.ceil(pagingContainer.children.length / 2);

        if (index >= 5 && nextPage?.classList.contains("book-hidden")) {
            nextPage.classList.remove("book-hidden");
        }

        // Show previous button if not on the first active page
        if (index > 0 && isActive && prevPage?.classList.contains("book-hidden")) {
            prevPage.classList.remove("book-hidden");
        }

        // Render button with active/visible styling
        return `<li  bc-value="${index + 1}" bc-name="cms.page" bc-triggers="click"
                  class="book-flex book-items-center book-justify-center book-w-12 book-h-12 book-rounded-xl book-transition-all book-duration-300 hover:book-bg-primary-50 hover:book-text-primary-800 book-cursor-pointer ${isActive ? 'book-active__paging book-bg-primary-50 book-text-primary-800' : 'book-bg-zinc-100 book-text-zinc-900'}">
                  ${page}
              </li>`;
    } catch (error) {
        console.error(`renderPaging: ${error.message}`);
        return "";
    }
};



const openRoomRulesModal = () => {
    const modal = document.getElementById('book-hotel__rules__modal');
    if (!modal) return;
    modal.classList.remove('book-hidden');
};

const closeRoomRulesModal = () => {
    const modal = document.getElementById('book-hotel__rules__modal');
    if (!modal) return;
    modal.classList.add('book-hidden');
};

document.addEventListener('click', (event) => {
    const closeBtn = event.target.closest('.book-hotel__close__rules');
    if (closeBtn) {
        closeRoomRulesModal();
        return;
    }

    const modal = document.getElementById('book-hotel__rules__modal');
    if (modal && event.target === modal) {
        closeRoomRulesModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeRoomRulesModal();
    }
});


window.roomRulesCache = window.roomRulesCache || {};
const showRules = async (el, optionId) => {
    try {
        const container = document.getElementById("book-hotel__rules__content");
        if (!container) {
            console.warn("book-hotel__rules__content not found");
            return;
        }

        const fallbackHtml = `
<div class="book-text-center book-py-6 book-text-xs book-text-zinc-500">
قوانینی برای این اتاق ثبت نشده است
</div>
`;

        // اگر قبلاً کش شده
        if (roomRulesCache[optionId]) {
            container.innerHTML = roomRulesCache[optionId];
            openRoomRulesModal();
            return;
        }

        // Loading
        container.innerHTML = `
<div class="book-text-center book-py-6 book-text-xs book-text-zinc-400">
در حال بارگذاری قوانین اتاق...
</div>
`;

        const providerId =
            window.cmsData && window.cmsData.provider
                ? Number(window.cmsData.provider)
                : 0;

        const dmnid =
            window.cmsData && window.cmsData.dmnid
                ? Number(window.cmsData.dmnid)
                : 0;

        const mainproviderObj = {
            provider_id: providerId,
            dmnid: dmnid,
        };

        const formData = new FormData();
        formData.append("mainprovider", JSON.stringify(mainproviderObj));
        formData.append("optionId", optionId);

        const response = await fetch("/Client_Room_Rule.bc", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(
                `Error retrieving room rules: ${response.status} ${response.statusText}`,
            );
        }

        const html = await response.text();
        const raw = (html || "").trim();

        // اگر سرور چیزی برنگردوند یا خروجی بی‌معنا بود
        const normalized = raw.replace(/\s+/g, " ").toLowerCase();
        const isEmpty =
            !raw ||
            raw === "null" ||
            raw === "undefined" ||
            raw === "[]" ||
            raw === "{}" ||
            normalized === '<div class="rule-room">msg: no data</div>' ||
            (normalized.includes('class="rule-room"') && normalized.includes("msg: no data"));

        const finalHtml = isEmpty ? fallbackHtml : html;

        roomRulesCache[optionId] = finalHtml;
        container.innerHTML = finalHtml;
        openRoomRulesModal();
    } catch (error) {
        console.error("Error loading room rules:", error);

        const container = document.getElementById("book-hotel__rules__content");
        if (container) {
            container.innerHTML = `
<div class="book-text-center book-py-6 book-text-xs book-text-zinc-500">
  خطا در دریافت قوانین اتاق. لطفاً دوباره تلاش کنید.
</div>
`;
            openRoomRulesModal();
        }
    }
};


function form_search_isSubmited(element, event) {
    let isValid = true
    element
        .querySelectorAll('input[name=fdate],input[name=tdate]')
        .forEach((e) => {
            if (e.value == '' && !e.disabled) {
                event.preventDefault()
                e.closest('.reserve-field').style.border = '1px solid #f42e36'
                isValid = false
            }
        })
    if (element.querySelector('input[name=Hotel-Date]')) {
        if (element.querySelector('input[name=Hotel-Date]').value == 1) {
            element
                .querySelectorAll('input[name=checkin],input[name=checkout]')
                .forEach((e) => {
                    if (e.value == '' && !e.disabled) {
                        event.preventDefault()
                        e.closest('.reserve-field').style.border = '1px solid #f42e36'
                        isValid = false
                    }
                })
        }
    }
    if (
        element.getAttribute('data-form') == 'hotel'
    ) {
        let childcountandage = element.querySelector('.childcountandage').value
        if (childcountandage == '0,') {
            element.querySelector('.childcountandage').value = 0
        }
        element.querySelectorAll('.contentRoom').forEach((e) => {
            let childCount = e.querySelector('.childcount').value,
                childAge = ''
            e.querySelectorAll('.createChildDropdown').forEach((ie) => {
                childAge += ',' + ie.querySelector('select').value
            })
            e.querySelector('.childcountandage').value = childCount + childAge
        })
    }
    if (isValid) {
        let georgiaDate = ''
        let georgiaDate_splited = ''

        if (element.querySelector('input[name=fdate]')) {
            if (element.querySelector('input[name=fdate]').value) {
                georgiaDate = element.querySelector('input[name=fdate]').value

                georgiaDate_splited = georgiaDate.split('-')
            }
        }

        if (
            parseInt(georgiaDate_splited[0]) > 1300 &&
            parseInt(georgiaDate_splited[0]) < 1500
        ) {
            georgiaDate = convert_jalali_toGregorian(georgiaDate)
        }
        var searchLang = 'fa'
        if (
            document.querySelector('.search-box-container').classList.contains('en')
        ) {
            var searchLang = 'en'
        } else if (
            document.querySelector('.search-box-container').classList.contains('ar')
        ) {
            var searchLang = 'ar'
        }
        if (element.getAttribute('data-form') == 'hotel') {
            const room = new Array()
            element.querySelectorAll('.contentRoom').forEach((e) => {
                let obj = new Object()
                obj['adult'] = e.querySelector('.adultcount').value
                obj['child'] = e.querySelector('.childcount').value
                obj['ages'] = e.querySelector('.childcountandage').value
                room.push(obj)
            })
            const hotel = {
                value: {
                    departure: {
                        name: `${element.querySelector('.departure').value}`,
                        id: `${element.querySelector('.from').value}`,
                    },
                    date: {
                        start: `${element.querySelector('.start_date').value}`,
                        end: `${element.querySelector('.end_date').value}`,
                    },
                    passengers: room,
                    persiancurrent: `${element.querySelector('.persiancurrent').value}`,
                    georgiaDate: georgiaDate,
                    action: `${element.getAttribute('action')}`,
                    method: `${element.getAttribute('method')}`,
                    dataform: `${element.getAttribute('data-form')}`,
                    searchLang: `${searchLang}`,
                },
                time: new Date().getTime(),
                // expire: new Date(georgiaDate).getTime(),
                expire: endOfDayLocalFromYMD(georgiaDate),
            }
            // add nationality if input exists
            const nationalityInput = element.querySelector(
                'input[name="nationality"]',
            )
            if (nationalityInput) {
                const closestReserve = nationalityInput.closest('.reserve-field')
                const departureValue = closestReserve
                    ? closestReserve.querySelector('.departure')?.value || ''
                    : ''
                hotel.value.nationality = {
                    id: nationalityInput.value,
                    name: departureValue,
                }
            }
            // add hotelname if input exists
            const hotelnameInput = element.querySelector('input[name="hotelid"]')
            const closestReserve = hotelnameInput
                ? hotelnameInput.closest('.reserve-field')
                : null
            const departureValue = closestReserve
                ? closestReserve.querySelector('.departure')?.value || ''
                : ''

            if (hotelnameInput && (hotelnameInput.value || departureValue)) {
                hotel.value.hotelname = {
                    id: hotelnameInput.value,
                    name: departureValue,
                }
            }
            set_searchHistory(hotel, 'hotel')
        }
    }
}

function show_passengerbox(e) {
    const element = e.closest(".reserve-field").querySelector(".hidden-box");
    const icon = e.closest(".reserve-field").querySelector(".down-icon");
    if (element) {
        if (element.classList.contains("book-hidden")) {
            element.classList.remove("book-hidden");
            element.style.maxHeight = '0px';
            void element.offsetHeight;
            element.style.maxHeight = element.scrollHeight * 6 + 'px';

        } else {
            element.style.maxHeight = '0px';
            element.addEventListener(
                "transitionend",
                () => {
                    element.classList.add("book-hidden");
                },
                { once: true }
            );
        }
    }
    if (icon) {
        icon.classList.toggle("book-rotate-180");
    }
}



function close_passenger(e) {
    if (window.innerWidth > 1024) {
        e.closest(".hidden-box").style.opacity = 0;
        e.closest(".hidden-box").addEventListener(
            "transitionend",
            () => {
                e.closest(".hidden-box").classList.add("book-hidden");
            },
            { once: true }
        );
    } else {
        e.closest(".hidden-box").classList.add("book-hidden");
    }
    let passBox = e.closest(".reserve-field");
    let icon = e.closest(".reserve-field").querySelector(".down-icon");
    if (passBox) {
        let nextDiv = passBox.nextElementSibling;
        if (nextDiv && nextDiv.classList.contains("reserve-field")) {
            let hiddenBox = nextDiv.querySelector(".hidden-box");
            if (hiddenBox) {
                hiddenBox.classList.remove("book-hidden");
            }
        }
    }
    if (icon) {
        icon.classList.remove("book-rotate-180");
    }
    if (document.querySelector("body").classList.contains("book-overflow-hidden")) {
        document.querySelector("body").classList.remove("book-overflow-hidden");
    }
}

function Change_Room_Count(t) {
    let e = parseInt(t.closest("ul").querySelector(".roomcount").value);
    let n = t.textContent.indexOf("+") > -1 ? e + 1 : e > 0 ? e - 1 : 0;

    if (n >= 1 && n < 5) {
        t.closest("ul").querySelector(".roomcount").value = n;

        if (e < n) {
            let s = n;

            const formEl = t.closest("form");

            // --- language detect (fa vs en) ---
            const lang =
                (formEl?.getAttribute("lang") ||
                    document.documentElement.getAttribute("lang") ||
                    "")
                    .toLowerCase();

            const dir =
                (formEl?.getAttribute("dir") ||
                    document.documentElement.getAttribute("dir") ||
                    "")
                    .toLowerCase();

            const isFa = lang.startsWith("fa") || lang.startsWith("ar") || dir === "rtl";

            // --- texts ---
            const TXT = isFa
                ? {
                    room: "اتاق",
                    removeRoom: "حذف اتاق",
                    adult: "بزرگسال",
                    adultAge: "(12 سال به بالا)",
                    child: "کودک",
                    childAge: "(0 تا 12 سال)",
                }
                : {
                    room: "Room",
                    removeRoom: "Remove room",
                    adult: "Adult",
                    adultAge: "(12+ years)",
                    child: "Child",
                    childAge: "(0–12 years)",
                };

            const roomsContainer = formEl.querySelector(".Rooms");
            const adult_count = t
                .closest(".reserve-field")
                .querySelector(".adult-count .count").textContent;
            const child_count = t
                .closest(".reserve-field")
                .querySelector(".child-count .count").textContent;

            const sum_passenger = parseInt(adult_count) + parseInt(child_count);
            let number_diff = 9 - parseInt(sum_passenger);

            if (number_diff >= 2 || formEl.getAttribute("id") == "hotelSearch") {
                new_adult = 2;
            } else {
                new_adult = number_diff;
            }

            let newRoom = document.createElement("div");
            newRoom.className =
                "contentRoom book-flex book-flex-col book-gap-2 book-border-t book-border-solid book-border-zinc-200 book-pt-2";

            newRoom.innerHTML = `
<div class="numberOfRoom">${TXT.room} ${s}</div>
<div class="deleteRoom book-hidden book-cursor-pointer" onclick="remove_Room(this)">${TXT.removeRoom}</div>

<div class="passenger-item adult-passenger-item book-w-full book-flex book-justify-between">
  <label for="passenger-room-adultcount${s}" class="book-flex book-items-center book-gap-1">
    <span>${TXT.adult}</span><span class="exp-age">${TXT.adultAge}</span>
  </label>
  <ul class="book-h-auto book-leading-normal book-flex book-items-center book-justify-between">
    <li class="plus-count book-leading-normal book-w-6 book-h-6 book-bg-primary-600 book-flex book-items-center book-justify-center book-rounded book-cursor-pointer">
      <div class="book-h-full book-leading-8" onclick="Change_AdultCount(this)">
        <span class="count-icon-simple book-text-white book-text-2xl">+</span><span class="count-icon-svg hidden"><svg class="align-middle" width="10" height="10"><use xlink:href="images/sprite-icons.svg#engine-plus-icon"></use></svg></span>
      </div>
    </li>
    <li class="book-w-6 book-h-6">
      <input id="passenger-room-adultcount${s}" type="text" class="adultcount book-w-full book-text-center book-bg-transparent" name="_root.rooms__${s}.adultcount" maxlength="4000" value=${new_adult} readonly />
    </li>
    <li class="minus-count book-leading-normal book-w-6 book-h-6 book-bg-primary-600 book-flex book-items-center book-justify-center book-rounded book-cursor-pointer">
      <div class="book-h-full book-leading-8" onclick="Change_AdultCount(this)">
        <span class="count-icon-simple book-text-white book-text-2xl">-</span><span class="count-icon-svg hidden"><svg class="align-middle" width="10" height="10"><use xlink:href="images/sprite-icons.svg#engine-minus-icon"></use></svg></span>
      </div>
    </li>
  </ul>
</div>

<div class="passenger-item child-passenger-item book-w-full book-flex book-justify-between">
  <label for="passenger-room-childcount${s}" class="book-flex book-items-center book-gap-1">
    <span>${TXT.child}</span><span class="exp-age">${TXT.childAge}</span>
  </label>
  <ul class="book-h-auto book-leading-normal book-flex book-items-center book-justify-between">
    <li class="plus-count book-leading-normal book-w-6 book-h-6 book-bg-primary-600 book-flex book-items-center book-justify-center book-rounded book-cursor-pointer">
      <div class="book-h-full book-leading-8" onclick="Change_ChildCount(this)">
        <span class="count-icon-simple book-text-white book-text-2xl">+</span><span class="count-icon-svg hidden"><svg class="align-middle" width="10" height="10"><use xlink:href="images/sprite-icons.svg#engine-plus-icon"></use></svg></span>
      </div>
    </li>
    <li class="book-w-6 book-h-6">
      <input id="passenger-room-childcount${s}" type="text" class="childcount book-w-full book-text-center book-bg-transparent" maxlength="4000" value="0" readonly />
    </li>
    <li class="minus-count book-leading-normal book-w-6 book-h-6 book-bg-primary-600 book-flex book-items-center book-justify-center book-rounded book-cursor-pointer">
      <div class="book-h-full book-leading-8" onclick="Change_ChildCount(this)">
        <span class="count-icon-simple book-text-white book-text-2xl">-</span><span class="count-icon-svg hidden"><svg class="align-middle" width="10" height="10"><use xlink:href="images/sprite-icons.svg#engine-minus-icon"></use></svg></span>
      </div>
    </li>
  </ul>
</div>

<input type="hidden" name="_root.rooms__${s}.childcountandage" class="childcountandage" />
<div class="section-select-age book-grid book-grid-cols-2 book-gap-2 book-mt-4"></div>
`;

            roomsContainer.appendChild(newRoom);

            const adult_cont_new = newRoom.querySelector(".adultcount").value;
            const sum_passenger_second = parseInt(sum_passenger) + parseInt(adult_cont_new);

            if (sum_passenger_second >= 8 && newRoom.closest("form").getAttribute("id") !== "hotelSearch") {
                if (newRoom.closest(".passengerbox").querySelector(".second-room-type")) {
                    newRoom.closest(".passengerbox").querySelector(".second-room-type").classList.add("disable-button");
                }
                newRoom.closest(".passengerbox").querySelectorAll(".plus-count").forEach((btn) => {
                    btn.classList.add("disable-button");
                });
            }
        } else if (e > n) {
            destroyRoomDropdown(t.closest("form").querySelector(".Rooms"), n);
        }

        const form = t.closest("form");
        form.querySelector(".passenger-counts").style.display = "inline-flex";
        form.querySelector(".room-count .count").textContent = n;
        Sum_AdultCount(t);
        Sum_ChildCount(t);
    }
}
function Add_Room_Count(t) {
    let e = parseInt(t.closest("ul").querySelector(".roomcount").value);
    let n = e + 1;

    if (n >= 1 && n < 5) {
        t.closest("ul").querySelector(".roomcount").value = n;

        if (e < n) {
            let s = n;

            const formEl = t.closest("form");

            // --- language detect (fa vs en) ---
            const lang =
                (formEl?.getAttribute("lang") ||
                    document.documentElement.getAttribute("lang") ||
                    "")
                    .toLowerCase();

            const dir =
                (formEl?.getAttribute("dir") ||
                    document.documentElement.getAttribute("dir") ||
                    "")
                    .toLowerCase();

            const isFa = lang.startsWith("fa") || lang.startsWith("ar") || dir === "rtl";

            // --- texts ---
            const TXT = isFa
                ? {
                    room: "اتاق",
                    removeRoom: "حذف اتاق",
                    adult: "بزرگسال",
                    adultAge: "(12 سال به بالا)",
                    child: "کودک",
                    childAge: "(0 تا 12 سال)",
                }
                : {
                    room: "Room",
                    removeRoom: "Remove room",
                    adult: "Adult",
                    adultAge: "(12+ years)",
                    child: "Child",
                    childAge: "(0–12 years)",
                };

            const roomsContainer = formEl.querySelector(".Rooms");

            const adult_count = t
                .closest(".reserve-field")
                .querySelector(".adult-count .count").textContent;

            const child_count = t
                .closest(".reserve-field")
                .querySelector(".child-count .count").textContent;

            const sum_passenger = parseInt(adult_count) + parseInt(child_count);
            let number_diff = 9 - parseInt(sum_passenger);

            if (number_diff >= 2 || formEl.getAttribute("id") == "hotelSearch") {
                new_adult = 2;
            } else {
                new_adult = number_diff;
            }

            let newRoom = document.createElement("div");
            newRoom.className = "contentRoom book-flex book-flex-col book-gap-2";

            newRoom.innerHTML = `
<div class="numberOfRoom">${TXT.room} ${s}</div>
<div class="deleteRoom book-hidden book-cursor-pointer" onclick="remove_Room(this)">${TXT.removeRoom}</div>

<div class="passenger-item adult-passenger-item book-w-full book-flex book-justify-between">
  <label for="passenger-room-adultcount${s}" class="book-flex book-items-center book-gap-1">
    <span>${TXT.adult}</span><span class="exp-age">${TXT.adultAge}</span>
  </label>
  <ul class="book-h-auto book-leading-normal book-flex book-items-center book-justify-between">
    <li class="plus-count book-leading-normal book-w-6 book-h-6 book-bg-primary-600 book-flex book-items-center book-justify-center book-rounded book-cursor-pointer">
      <div class="book-h-full book-leading-8" onclick="Change_AdultCount(this)">
        <span class="count-icon-simple book-text-white book-text-2xl">+</span><span class="count-icon-svg hidden"><svg class="align-middle" width="10" height="10"><use xlink:href="images/sprite-icons.svg#engine-plus-icon"></use></svg></span>
      </div>
    </li>
    <li class="book-w-6 book-h-6">
      <input id="passenger-room-adultcount${s}" type="text" class="adultcount book-w-full book-text-center book-bg-transparent" name="_root.rooms__${s}.adultcount" maxlength="4000" value=${new_adult} readonly />
    </li>
    <li class="minus-count book-leading-normal book-w-6 book-h-6 book-bg-primary-600 book-flex book-items-center book-justify-center book-rounded book-cursor-pointer">
      <div class="book-h-full book-leading-8" onclick="Change_AdultCount(this)">
        <span class="count-icon-simple book-text-white book-text-2xl">-</span><span class="count-icon-svg hidden"><svg class="align-middle" width="10" height="10"><use xlink:href="images/sprite-icons.svg#engine-minus-icon"></use></svg></span>
      </div>
    </li>
  </ul>
</div>

<div class="passenger-item child-passenger-item book-w-full book-flex book-justify-between">
  <label for="passenger-room-childcount${s}" class="book-flex book-items-center book-gap-1">
    <span>${TXT.child}</span><span class="exp-age">${TXT.childAge}</span>
  </label>
  <ul class="book-h-auto book-leading-normal book-flex book-items-center book-justify-between">
    <li class="plus-count book-leading-normal book-w-6 book-h-6 book-bg-primary-600 book-flex book-items-center book-justify-center book-rounded book-cursor-pointer">
      <div class="book-h-full book-leading-8" onclick="Change_ChildCount(this)">
        <span class="count-icon-simple book-text-white book-text-2xl">+</span><span class="count-icon-svg hidden"><svg class="align-middle" width="10" height="10"><use xlink:href="images/sprite-icons.svg#engine-plus-icon"></use></svg></span>
      </div>
    </li>
    <li class="book-w-6 book-h-6">
      <input id="passenger-room-childcount${s}" type="text" class="childcount book-w-full book-text-center book-bg-transparent" maxlength="4000" value="0" readonly />
    </li>
    <li class="minus-count book-leading-normal book-w-6 book-h-6 book-bg-primary-600 book-flex book-items-center book-justify-center book-rounded book-cursor-pointer">
      <div class="book-h-full book-leading-8" onclick="Change_ChildCount(this)">
        <span class="count-icon-simple book-text-white book-text-2xl">-</span><span class="count-icon-svg hidden"><svg class="align-middle" width="10" height="10"><use xlink:href="images/sprite-icons.svg#engine-minus-icon"></use></svg></span>
      </div>
    </li>
  </ul>
</div>

<input type="hidden" name="_root.rooms__${s}.childcountandage" class="childcountandage" />
<div class="section-select-age book-grid book-grid-cols-2 book-gap-2 book-mt-4"></div>
`;

            roomsContainer.appendChild(newRoom);

            const adult_cont_new = newRoom.querySelector(".adultcount").value;
            const sum_passenger_second = parseInt(sum_passenger) + parseInt(adult_cont_new);

            if (sum_passenger_second >= 8 && newRoom.closest("form").getAttribute("id") !== "hotelSearch") {
                if (newRoom.closest(".passengerbox").querySelector(".second-room-type")) {
                    newRoom.closest(".passengerbox").querySelector(".second-room-type").classList.add("disable-button");
                }
                newRoom.closest(".passengerbox").querySelectorAll(".plus-count").forEach((btn) => {
                    btn.classList.add("disable-button");
                });
            }
        } else if (e > n) {
            destroyRoomDropdown(t.closest("form").querySelector(".Rooms"), n);
        }

        const form = t.closest("form");
        form.querySelector(".passenger-counts").style.display = "inline-flex";
        form.querySelector(".room-count .count").textContent = n;
        Sum_AdultCount(t);
        Sum_ChildCount(t);
    }
}
function remove_Room(e) {
    let room = e.closest(".contentRoom");
    let t = e.closest(".Rooms");
    let k = e.closest(".reserve-field");
    let count = 1;
    room.remove();
    let roomsContainer = document.querySelector(".Rooms");
    let rooms = roomsContainer.querySelectorAll(".contentRoom");
    rooms.forEach((room, index) => {
        room.querySelector(".numberOfRoom").textContent = `اتاق${index + 1}`;
        room
            .querySelector("input.adultcount")
            .setAttribute("name", `_root.rooms__${index + 1}.adultcount`);
        room
            .querySelector("input.childcount")
            .setAttribute("name", `_root.rooms__${index + 1}.childcount`);
        room
            .querySelector("input.childcountandage")
            .setAttribute("name", `_root.rooms__${index + 1}.childcountandage`);
        count = index + 1;
    });
    t
        .closest(".passengers-field")
        .querySelector(".room-count .count").textContent = count;
    t.closest(".passengers-field").querySelector(".roomcount ").value = count;
    Sum_AdultCount(t);
    Sum_ChildCount(t);
    const adult_count = k.querySelector(".adult-count .count").textContent;
    const child_count = k.querySelector(".child-count .count").textContent;
    const sum_passenger = parseInt(adult_count) + parseInt(child_count);
    if (sum_passenger < 9) {
        k.querySelectorAll(".plus-count").forEach((btn) => {
            if (btn.classList.contains("disable-button")) {
                btn.classList.remove("disable-button");
            }
        });
    }
}
function destroyRoomDropdown(container, count) {
    if (count < 1) return;
    const roomToRemove = container.querySelector(
        `div.contentRoom:nth-child(${count + 1})`
    );
    if (roomToRemove) roomToRemove.remove();
    let adult_count = 0;
    let child_count = 0;
    container.querySelectorAll(".adultcount").forEach((adult) => {
        adult_count += parseInt(adult.value) || 0;
    });
    container.querySelectorAll(".childcount").forEach((child) => {
        child_count += parseInt(child.value) || 0;
    });
    const sum_passenger = parseInt(adult_count) + parseInt(child_count);
    if (sum_passenger < 9) {
        container
            .closest(".passengerbox")
            .querySelectorAll(".plus-count")
            .forEach((btn) => {
                if (btn.classList.contains("disable-button")) {
                    btn.classList.remove("disable-button");
                }
            });
    }
}
function Change_AdultCount(t) {
    const button = t.querySelector("span");
    const adultCountInput = button.closest("ul").querySelector(".adultcount");
    const currentValue = parseInt(adultCountInput.value);
    const updatedValue =
        button.textContent.indexOf("+") > -1
            ? currentValue + 1
            : currentValue > 0
                ? currentValue - 1
                : 0;
    if (updatedValue < 10 || updatedValue >= 1) {
        adultCountInput.value = updatedValue;
        Sum_AdultCount(button);
    }
    Check_Passenger_Count(t);
}
function Sum_AdultCount(t) {
    let totalAdults = 0;
    const form = t.closest("form");
    form.querySelectorAll(".contentRoom").forEach((room) => {
        const adultCountInput = room.querySelector(".adultcount");
        totalAdults += parseInt(adultCountInput.value) || 0;
    });
    form.querySelector(".passenger-counts").style.display = "inline-flex";
    form.querySelector(".adult-count .count").textContent = totalAdults;
}
function Change_ChildCount(t) {
    const room = t.closest(".contentRoom");
    const formEl = t.closest("form");

    // --- language detect (fa vs en) ---
    const lang =
        (formEl?.getAttribute("lang") ||
            document.documentElement.getAttribute("lang") ||
            "")
            .toLowerCase();

    const dir =
        (formEl?.getAttribute("dir") ||
            document.documentElement.getAttribute("dir") ||
            "")
            .toLowerCase();

    const isFa = lang.startsWith("fa") || lang.startsWith("ar") || dir === "rtl";

    // ordinals
    const ordinalWordsFa = ["اول", "دوم", "سوم", "چهارم"];
    const ordinalWordsEn = ["First", "Second", "Third", "Fourth"];
    const ordinalWords = isFa ? ordinalWordsFa : ordinalWordsEn;

    // label text
    const childAgeLabel = isFa ? "سن کودک" : "Child age";

    // options
    const optionsHtml = isFa
        ? `
<option value="1">تا 1 سال</option>
<option value="2">1 تا 2</option>
<option value="3">2 تا 3</option>
<option value="4">3 تا 4</option>
<option value="5">4 تا 5</option>
<option value="6">5 تا 6</option>
<option value="7">6 تا 7</option>
<option value="8">7 تا 8</option>
<option value="9">8 تا 9</option>
<option value="10">9 تا 10</option>
<option value="11">10 تا 11</option>
<option value="12">11 تا 12</option>
`
        : `
<option value="1">Up to 1 year</option>
<option value="2">1 to 2</option>
<option value="3">2 to 3</option>
<option value="4">3 to 4</option>
<option value="5">4 to 5</option>
<option value="6">5 to 6</option>
<option value="7">6 to 7</option>
<option value="8">7 to 8</option>
<option value="9">8 to 9</option>
<option value="10">9 to 10</option>
<option value="11">10 to 11</option>
<option value="12">11 to 12</option>
`;

    const span = t.querySelector("span");
    const childCountInput = t.closest("ul").querySelector(".childcount");
    const currentCount = parseInt(childCountInput.value);

    const updatedCount =
        span.textContent.indexOf("+") > -1
            ? currentCount + 1
            : currentCount > 0
                ? currentCount - 1
                : 0;

    if (updatedCount < 5) {
        childCountInput.value = updatedCount;

        if (currentCount < updatedCount) {
            const sectionSelectAge = room.querySelector(".section-select-age");
            sectionSelectAge.innerHTML = ""; // Clear the section

            for (let i = 1; i <= updatedCount; i++) {
                const e = document.createElement("div");
                e.className = "createChildDropdown book-mb-4";

                e.innerHTML = `
  <label for="select-age${i}" class="">
    ${childAgeLabel} ${ordinalWords[i - 1] || i}
  </label>
  <select class="select-age book-w-full book-border book-border-solid book-border-zinc-600 book-rounded-lg book-px-3 book-h-8 book-mt-2" id="select-age${i}">
    ${optionsHtml}
  </select>
`;

                sectionSelectAge.appendChild(e);
            }
        } else if (currentCount > updatedCount) {
            const childDropdownsContainer = span
                .closest(".contentRoom")
                .querySelector(".section-select-age");
            destroyChildDropdown(childDropdownsContainer, updatedCount);
        }
    }

    Sum_ChildCount(t);
    Check_Passenger_Count(t);
}
function Sum_ChildCount(t) {
    let totalChildren = 0;

    const form = t.closest("form");
    form.querySelectorAll(".contentRoom").forEach((room) => {
        const childCountInput = room.querySelector(".childcount");
        totalChildren += parseInt(childCountInput.value) || 0;
    });

    if (
        form.querySelector(".child-count").classList.contains("hidden") &&
        totalChildren > 0
    ) {
        form.querySelector(".child-count").classList.remove("hidden");
    } else if (
        !form.querySelector(".child-count").classList.contains("hidden") &&
        totalChildren == 0
    ) {
        form.querySelector(".child-count").classList.add("hidden");
    }

    form.querySelector(".child-count .count").textContent = totalChildren;
    form.querySelector(".passenger-counts").style.display = "inline-flex";
}
function destroyChildDropdown(t, e) {
    const dropdowns = t.querySelectorAll("div.createChildDropdown");
    if (dropdowns[e]) {
        dropdowns[e].remove();
    }
}
function Check_Passenger_Count(t) {
    const module = t.closest("form").getAttribute("id");
    if (module == "hotelSearch") {
        if (
            t.closest(".passenger-item").classList.contains("adult-passenger-item")
        ) {
            const adult_count = t.closest("ul").querySelector(".adultcount").value;
            if (adult_count > 13) {
                if (!t.closest(".plus-count").classList.contains("disable-button")) {
                    t.closest(".plus-count").classList.add("disable-button");
                }
            } else {
                if (t.closest(".contentRoom").querySelector(".alert-adults")) {
                    t.closest(".contentRoom").querySelector(".alert-adults").remove();
                }
                t.closest(".contentRoom")
                    .querySelectorAll(".plus-count")
                    .forEach(function (button) {
                        if (button.classList.contains("disable-button")) {
                            button.classList.remove("disable-button");
                        }
                    });
                if (
                    t.closest(".passengerbox").querySelector(".second-room-type") &&
                    t
                        .closest(".passengerbox")
                        .querySelector(".second-room-type")
                        .classList.contains("disable-button")
                ) {
                    t.closest(".passengerbox")
                        .querySelector(".second-room-type")
                        .classList.remove("disable-button");
                }
            }
        }
    } else {
        const adult_count = t
            .closest(".passengers-field")
            .querySelector(".adult-count")
            .querySelector(".count").textContent;
        const child_count = t
            .closest(".passengers-field")
            .querySelector(".child-count")
            .querySelector(".count").textContent;
        let sum_passenger = 0;
        if (module == "flightSearch" || module == "serviceSearch") {
            const infant_count = t
                .closest(".passengers-field")
                .querySelector(".infant-count")
                .querySelector(".count").textContent;
            sum_passenger =
                parseInt(adult_count) + parseInt(child_count) + parseInt(infant_count);
        } else {
            sum_passenger = parseInt(adult_count) + parseInt(child_count);
        }
        if (sum_passenger > 8) {
            t.closest(".passengerbox")
                .querySelectorAll(".plus-count")
                .forEach(function (button) {
                    if (!button.classList.contains("disable-button")) {
                        button.classList.add("disable-button");
                    }
                });
        } else {
            if (t.closest(".passengerbox").querySelector(".alert-passengers")) {
                t.closest(".passengerbox").querySelector(".alert-passengers").remove();
            }
            t.closest(".passengerbox")
                .querySelectorAll(".plus-count")
                .forEach(function (button) {
                    if (button.classList.contains("disable-button")) {
                        button.classList.remove("disable-button");
                    }
                });
            if (
                t.closest(".passengerbox").querySelector(".second-room-type") &&
                t
                    .closest(".passengerbox")
                    .querySelector(".second-room-type")
                    .classList.contains("disable-button")
            ) {
                t.closest(".passengerbox")
                    .querySelector(".second-room-type")
                    .classList.remove("disable-button");
            }
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.date__searched__container');
    if (!container) return;

    const datePicker = container.querySelector('.book-hotel__date__picker');
    const dropdownWrapper = container.querySelector('.book-date__dropdown-wrapper');
    const icon = container.querySelector('.book-date__icon');

    if (!datePicker || !dropdownWrapper) {
        console.warn('date picker elements not found');
        return;
    }

    const openDropdown = () => {
        dropdownWrapper.style.maxHeight = '0px';
        void dropdownWrapper.offsetHeight;
        const fullHeight = dropdownWrapper.scrollHeight;
        dropdownWrapper.style.maxHeight = fullHeight + 'px';

        if (icon) icon.classList.add('book-rotate-180');
    };

    const closeDropdown = () => {
        dropdownWrapper.style.maxHeight = '0px';
        if (icon) icon.classList.remove('book-rotate-180');
    };

    datePicker.addEventListener('click', (e) => {
        e.stopPropagation();

        const isClosed = dropdownWrapper.style.maxHeight === '' || dropdownWrapper.style.maxHeight === '0px';

        if (isClosed) {
            openDropdown();
        } else {
            closeDropdown();
        }
    });

});

document.addEventListener("DOMContentLoaded", () => {
    const dateInputs = document.querySelectorAll(".js-date-input");

    if (dateInputs.length === 0) {
        return;
    }

    function calculateDateDifference(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return 0;
        }

        const timeDifference = end - start;
        return timeDifference / (1000 * 3600 * 24);
    }

    function getHotelLangTexts() {
        const lang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
        const dir = (document.documentElement.getAttribute("dir") || "").toLowerCase();
        const isFa = lang.startsWith("fa") || lang.startsWith("ar") || dir === "rtl";

        return {
            isFa,
            nightsLabel: isFa ? "شب" : "night(s)",
            tillLabel: isFa ? " تا" : " to",
        };
    }

    function updateDateFields() {
        const startDateInput = document.querySelector(".js-date-input.start_date");
        const endDateInput = document.querySelector(".js-date-input.end_date");
        if (!startDateInput || !endDateInput) return;

        const startDateJalali = startDateInput.getAttribute("data-jalali") || "";
        const startDateGregorian = startDateInput.getAttribute("data-gregorian") || "";

        const endDateJalali = endDateInput.getAttribute("data-jalali") || "";
        const endDateGregorian = endDateInput.getAttribute("data-gregorian") || "";

        const fdate = document.querySelector(".book-hotel__fdate");
        const tdate = document.querySelector(".book-hotel__tdate");
        const nightsElem = document.querySelector(".book-hotel__nights");
        const tillText = document.querySelector(".book-hotel__till-text");

        if (fdate) fdate.innerText = startDateJalali;
        if (tdate) tdate.innerText = endDateJalali;

        const { nightsLabel, tillLabel } = getHotelLangTexts();

        if (startDateGregorian && endDateGregorian) {
            const dayDifference = calculateDateDifference(startDateGregorian, endDateGregorian);
            if (nightsElem) nightsElem.innerText = dayDifference ? `${dayDifference} ${nightsLabel}` : "";
        } else {
            if (nightsElem) nightsElem.innerText = "";
        }

        if (tdate && tdate.innerText.trim() !== "") {
            if (tillText) tillText.innerText = tillLabel;
        } else {
            if (tillText) tillText.innerText = "";
        }
    }

    const dateInputsObserver = new MutationObserver(() => {
        updateDateFields();
    });

    dateInputs.forEach(input => {
        dateInputsObserver.observe(input, {
            attributes: true,
            attributeFilter: ['data-jalali', 'data-gregorian'],
        });
    });

    updateDateFields();
});




const onProcessedapiGallery = async (args) => {
    const response = args.response;
    const responseJson = await response.json();

    const updatedJson = (Array.isArray(responseJson) ? responseJson : []).map((item) => {
        const src = (item?.originalImage || "").trim();

        if (!src) return item;

        const hasDomain = src.startsWith("http://") || src.startsWith("https://");
        const normalized = !hasDomain && !src.startsWith("/") ? "/" + src : src;

        return {
            ...item,
            originalImage: normalized,
        };
    });

    $bc.setSource("api.newGallery", updatedJson);

    return updatedJson;
};
function setupHotelMoreinfoModal() {
    const modal = document.getElementById("hotel-moreinfo-modal");
    if (!modal) return;

    const open = () => {
        modal.classList.remove("book-hidden");
        modal.classList.add("book-flex");
    };

    const close = () => {
        modal.classList.add("book-hidden");
        modal.classList.remove("book-flex");
    };

    document.querySelectorAll(".open-hotel-moreinfo-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            open();
        });
    });

    document.querySelectorAll(".close-hotel-moreinfo-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            close();
        });
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) close();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.classList.contains("book-hidden")) close();
    });
}

document.addEventListener("DOMContentLoaded", setupHotelMoreinfoModal);
