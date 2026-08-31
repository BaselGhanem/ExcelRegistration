(() => {
  `use strict`;

  const CONFIG = {
    whatsapp: `https://wa.me/962788458787`,
    excel: {
      fit: `أنسب إذا كان عملك اليومي يعتمد على الجداول، المعادلات، التحليل والتقارير داخل Excel.`,
      path: [`بيانات مرتبة`, `معادلات ذكية`, `تحليل أسرع`, `Dashboard قابل للتحديث`],
      moduleQuestions: [
        `كيف أرتب البيانات قبل ما أبدأ التحليل؟`,
        `كيف أخلي المعادلات تجيب عن سؤال العمل بدل حفظها فقط؟`,
        `كيف ألخص كمية كبيرة من البيانات بشكل أسرع؟`,
        `كيف أحول التحليل إلى شاشة تساعد على اتخاذ القرار؟`
      ],
      before: `ملفات وجداول تحتاج ترتيباً وتحليلاً يدوياً كل مرة.`,
      after: `بيانات منظمة وتحليل أوضح وDashboard يمكن تحديثه وإعادة استخدامه.`
    },
    powerbi: {
      fit: `أنسب إذا كان هدفك بناء Dashboards تفاعلية، ربط أكثر من مصدر بيانات، وتحويل الأرقام إلى تقارير قابلة للمشاركة.`,
      path: [`بيانات خام`, `Power Query`, `Data Model`, `DAX`, `Interactive Report`],
      moduleQuestions: [
        `كيف أوصل البيانات الخام إلى شكل جاهز للتحليل؟`,
        `كيف أربط الجداول بطريقة تمنع النتائج الخاطئة؟`,
        `كيف أبني حسابات تجيب عن أسئلة العمل؟`,
        `كيف أعرض النتيجة بحيث تُفهم بسرعة؟`
      ],
      before: `مصادر بيانات منفصلة وأرقام يصعب جمعها في صورة واحدة.`,
      after: `نموذج بيانات مترابط وتقرير تفاعلي يوضح القصة وراء الأرقام.`
    }
  };

  const state = {
    modalOpen: false,
    answers: {},
    lastStep: null
  };

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

  const el = (tag, className, html = ``) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html) node.innerHTML = html;
    return node;
  };

  const getStep = () => {
    const journey = qs(`.journey`);
    if (!journey) return null;
    const match = [...journey.classList].find((name) => name.startsWith(`journey-step-`));
    return match ? Number(match.replace(`journey-step-`, ``)) : null;
  };

  const getCourse = () => {
    const selected = qs(`.course-cards button.selected b`);
    if (selected) return selected.textContent.includes(`Power BI`) ? `powerbi` : `excel`;
    const subtitle = qs(`.content-panel > .subtitle`);
    return subtitle?.textContent.includes(`Power BI`) ? `powerbi` : `excel`;
  };

  const addOnce = (key, parent, create) => {
    if (!parent || parent.querySelector(`[data-xa-enhancement="${key}"]`)) return null;
    const node = create();
    node.dataset.xaEnhancement = key;
    parent.appendChild(node);
    return node;
  };

  const insertAfterOnce = (key, reference, create) => {
    if (!reference?.parentElement || reference.parentElement.querySelector(`[data-xa-enhancement="${key}"]`)) return null;
    const node = create();
    node.dataset.xaEnhancement = key;
    reference.insertAdjacentElement(`afterend`, node);
    return node;
  };

  const updateAccessibleLabels = () => {
    qsa(`button, a`).forEach((node) => {
      if (!node.hasAttribute(`aria-label`) && !node.textContent.trim()) {
        node.setAttribute(`aria-label`, node.getAttribute(`title`) || `عنصر تفاعلي`);
      }
    });
  };

  const enhanceStepZero = () => {
    const choice = qs(`.course-choice`);
    if (!choice) return;

    const subtitle = qs(`.content-panel > .subtitle`);
    if (subtitle) subtitle.textContent = `Excel أم Power BI؟ اختر المسار الأقرب لهدفك، أو استخدم مساعد الاختيار إذا لم تكن متأكداً.`;

    const lead = qs(`.course-choice > .lead`);
    if (lead) {
      lead.textContent = `اختر المسار الأقرب لهدفك. وإذا لم تكن متأكداً من الفرق، سنساعدك تختار قبل أن تكمل.`;
    }

    qsa(`.course-cards button`).forEach((button) => {
      const title = qs(`b`, button)?.textContent || ``;
      const course = title.includes(`Power BI`) ? `powerbi` : `excel`;
      if (!qs(`.xa-course-fit`, button)) {
        const fit = el(`span`, `xa-course-fit`, CONFIG[course].fit);
        button.appendChild(fit);
      }
    });

    addOnce(`brand-positioning`, choice, () => {
      const box = el(`div`, `xa-brand-positioning`);
      box.innerHTML = `<span>X Academy</span><p>نتعلم الأداة من خلال سؤال العمل والنتيجة التي نريد الوصول إليها - وليس بحفظ الأزرار فقط.</p>`;
      return box;
    });

    addOnce(`course-finder`, choice, () => {
      const button = el(`button`, `xa-course-finder`, `<span aria-hidden="true">✦</span><span><b>مش متأكد أي مسار يناسبك؟</b><small>3 أسئلة قصيرة ونشرح لك سبب التوصية</small></span>`);
      button.type = `button`;
      button.addEventListener(`click`, openCourseFinder);
      return button;
    });
  };

  const finderQuestions = [
    {
      id: `work`,
      title: `أغلب شغلك اليوم وين؟`,
      options: [
        { label: `داخل Excel والجداول`, value: `excel`, score: { excel: 3, powerbi: 0 } },
        { label: `تقارير ولوحات ومصادر متعددة`, value: `powerbi`, score: { excel: 0, powerbi: 3 } },
        { label: `الاثنين / مش متأكد`, value: `both`, score: { excel: 1, powerbi: 1 } }
      ]
    },
    {
      id: `goal`,
      title: `شو النتيجة الأقرب لهدفك؟`,
      options: [
        { label: `أتمتة وتحليل ملفات العمل اليومية`, value: `excel`, score: { excel: 3, powerbi: 0 } },
        { label: `بناء Dashboards وتقارير تفاعلية`, value: `powerbi`, score: { excel: 0, powerbi: 3 } },
        { label: `أريد بناء أساس قوي ثم أتوسع`, value: `foundation`, score: { excel: 2, powerbi: 1 } }
      ]
    },
    {
      id: `experience`,
      title: `خبرتك الحالية الأقرب لأي خيار؟`,
      options: [
        { label: `مبتدئ أو أستخدم Excel بشكل بسيط`, value: `beginner`, score: { excel: 2, powerbi: 0 } },
        { label: `مرتاح مع Excel وأريد نقلة أكبر`, value: `excel-user`, score: { excel: 0, powerbi: 2 } },
        { label: `سبق واستخدمت Power BI`, value: `pbi-user`, score: { excel: 0, powerbi: 2 } }
      ]
    }
  ];

  const openCourseFinder = () => {
    if (state.modalOpen) return;
    state.modalOpen = true;
    state.answers = {};

    const overlay = el(`div`, `xa-modal-overlay`);
    overlay.setAttribute(`role`, `dialog`);
    overlay.setAttribute(`aria-modal`, `true`);
    overlay.setAttribute(`aria-labelledby`, `xa-finder-title`);

    const modal = el(`div`, `xa-modal`);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    let index = 0;

    const close = () => {
      state.modalOpen = false;
      overlay.remove();
    };

    const render = () => {
      const question = finderQuestions[index];
      modal.innerHTML = ``;

      const head = el(`div`, `xa-modal-head`, `<div><small>مساعد اختيار المسار</small><h2 id="xa-finder-title">${question ? question.title : `المسار الأقرب لهدفك`}</h2></div>`);
      const closeButton = el(`button`, `xa-modal-close`, `×`);
      closeButton.type = `button`;
      closeButton.setAttribute(`aria-label`, `إغلاق`);
      closeButton.addEventListener(`click`, close);
      head.appendChild(closeButton);
      modal.appendChild(head);

      if (question) {
        const progress = el(`div`, `xa-mini-progress`, `<span style="width:${((index + 1) / finderQuestions.length) * 100}%"></span>`);
        modal.appendChild(progress);
        const options = el(`div`, `xa-finder-options`);
        question.options.forEach((option) => {
          const button = el(`button`, ``, `<span>${option.label}</span><i aria-hidden="true">←</i>`);
          button.type = `button`;
          button.addEventListener(`click`, () => {
            state.answers[question.id] = option;
            index += 1;
            render();
          });
          options.appendChild(button);
        });
        modal.appendChild(options);
        modal.appendChild(el(`p`, `xa-finder-note`, `هذه توصية إرشادية فقط، وليست اختبار مستوى أو حكماً على خبرتك.`));
        return;
      }

      const score = { excel: 0, powerbi: 0 };
      Object.values(state.answers).forEach((answer) => {
        score.excel += answer.score.excel;
        score.powerbi += answer.score.powerbi;
      });
      const recommendation = score.powerbi > score.excel ? `powerbi` : `excel`;
      const answerGoal = state.answers.goal?.label || ``;
      const answerWork = state.answers.work?.label || ``;
      const label = recommendation === `powerbi` ? `Power BI Specialist` : `Excel الاحترافي`;
      const reason = recommendation === `powerbi`
        ? `لأن اختياراتك تميل إلى ${answerGoal || `التقارير التفاعلية`}، ومع طبيعة عمل أقرب إلى ${answerWork || `مصادر البيانات المتعددة`}.`
        : `لأن اختياراتك تميل إلى ${answerGoal || `تحليل وأتمتة ملفات العمل`}، ومع طبيعة عمل أقرب إلى ${answerWork || `Excel والجداول`}.`;

      modal.appendChild(el(`div`, `xa-recommendation`, `<small>توصيتنا الإرشادية</small><strong>${label}</strong><p>${reason}</p>`));

      const actions = el(`div`, `xa-modal-actions`);
      const apply = el(`button`, `xa-primary`, `اختيار هذا المسار`);
      apply.type = `button`;
      apply.addEventListener(`click`, () => {
        const cards = qsa(`.course-cards button`);
        const target = cards.find((card) => {
          const text = card.textContent;
          return recommendation === `powerbi` ? text.includes(`Power BI`) : text.includes(`Excel`);
        });
        target?.click();
        close();
      });
      const restart = el(`button`, `xa-secondary`, `إعادة الأسئلة`);
      restart.type = `button`;
      restart.addEventListener(`click`, () => {
        index = 0;
        state.answers = {};
        render();
      });
      actions.append(apply, restart);
      modal.appendChild(actions);
    };

    overlay.addEventListener(`click`, (event) => {
      if (event.target === overlay) close();
    });
    document.addEventListener(`keydown`, function escapeHandler(event) {
      if (event.key === `Escape` && overlay.isConnected) {
        close();
        document.removeEventListener(`keydown`, escapeHandler);
      }
    });

    render();
    qs(`button`, modal)?.focus();
  };

  const enhanceStepOne = () => {
    const stack = qs(`.feature-stack`);
    if (!stack) return;
    const course = getCourse();
    const facts = qs(`.fact-row`, stack);

    insertAfterOnce(`learning-path`, facts, () => {
      const box = el(`section`, `xa-learning-path`);
      const items = CONFIG[course].path.map((item, index) => `<span><b>${String(index + 1).padStart(2, `0`)}</b>${item}</span>`).join(`<i aria-hidden="true">←</i>`);
      box.innerHTML = `<div class="xa-section-label">كيف تتطور الرحلة؟</div><div class="xa-path-flow">${items}</div>`;
      return box;
    });

    const trainerCard = qs(`.trainer-card`, stack);
    if (trainerCard) {
      const whatsapp = qs(`a.whatsapp`, trainerCard);
      if (whatsapp) whatsapp.innerHTML = `${whatsapp.querySelector(`svg`)?.outerHTML || ``}<span>اسأل المدرب</span>`;
      addOnce(`level-question`, trainerCard, () => {
        const note = el(`a`, `xa-level-question`, `غير متأكد إذا المسار مناسب لمستواك؟ اسأل المدرب قبل التسجيل ←`);
        note.href = CONFIG.whatsapp;
        note.target = `_blank`;
        note.rel = `noreferrer`;
        return note;
      });
    }
  };

  const enhanceStepTwo = () => {
    const outcomes = qs(`.outcomes`);
    if (!outcomes) return;
    const course = getCourse();

    insertAfterOnce(`transformation`, outcomes, () => {
      const box = el(`section`, `xa-transformation`);
      box.innerHTML = `<div><small>قبل</small><p>${CONFIG[course].before}</p></div><i aria-hidden="true">←</i><div><small>بعد بناء المهارة</small><p>${CONFIG[course].after}</p></div>`;
      return box;
    });
  };

  const enhanceStepThree = () => {
    const modules = qs(`.modules`);
    if (!modules) return;
    const course = getCourse();
    const questions = CONFIG[course].moduleQuestions;
    qsa(`article`, modules).forEach((article, index) => {
      if (qs(`.xa-module-why`, article)) return;
      const body = qs(`div`, article);
      if (!body) return;
      const why = el(`p`, `xa-module-why`, `<span>ليش هذا الجزء؟</span>${questions[index] || ``}`);
      body.appendChild(why);
    });

    insertAfterOnce(`jargon-help`, modules, () => {
      const box = el(`div`, `xa-jargon-help`);
      box.innerHTML = course === `powerbi`
        ? `<b>مصطلحات جديدة؟</b><span><strong>Power Query</strong> = تجهيز وتنظيف البيانات</span><span><strong>Data Model</strong> = تنظيم الجداول والعلاقات</span><span><strong>DAX</strong> = حسابات ذكية داخل النموذج</span>`
        : `<b>الفكرة ليست حفظ الأدوات.</b><span>كل جزء في المنهج مربوط بسؤال عملي: تجهيز البيانات، إيجاد الإجابة، تلخيصها، ثم عرضها.</span>`;
      return box;
    });
  };

  const enhanceStepFour = () => {
    const schedule = qs(`.schedule-list`);
    if (!schedule) return;
    insertAfterOnce(`schedule-summary`, schedule, () => {
      const box = el(`div`, `xa-schedule-summary`);
      box.innerHTML = `<span><b>10</b> جلسات</span><span><b>20</b> ساعة تدريب مباشر</span><a href="${CONFIG.whatsapp}" target="_blank" rel="noreferrer">عندك سؤال عن الغياب أو التسجيلات؟ اسألنا ←</a>`;
      return box;
    });
  };

  const enhanceStepFive = () => {
    const investment = qs(`.investment`);
    if (!investment) return;
    const priceLabel = qs(`.price > small`, investment);
    if (priceLabel) priceLabel.textContent = `رسوم البرنامج`;
    const priceCopy = qs(`.price > p`, investment);
    if (priceCopy) priceCopy.textContent = `دفعة واحدة تشمل التدريب المباشر والتسجيلات وملفات التطبيق والشهادات.`;
    qsa(`li`, investment).forEach((item) => {
      item.innerHTML = item.innerHTML.replace(`شهادة إتمام معتمدة`, `شهادة إتمام`);
    });
    insertAfterOnce(`price-clarity`, investment, () => {
      const box = el(`div`, `xa-price-clarity`);
      box.innerHTML = `<span>دفعة واحدة</span><p>المذكور أعلاه هو ما يتضمنه البرنامج حالياً. إذا احتجت تفاصيل عن الدفع أو تثبيت المقعد، اسألنا قبل إرسال طلب التسجيل.</p><a href="${CONFIG.whatsapp}" target="_blank" rel="noreferrer">اسأل عن التسجيل والدفع ←</a>`;
      return box;
    });
  };

  const enhanceStepSix = () => {
    const review = qs(`.review`);
    if (!review) return;
    qsa(`p`, review).forEach((paragraph) => {
      paragraph.textContent = paragraph.textContent.replace(`شهادة إتمام معتمدة`, `شهادة إتمام`);
    });
    insertAfterOnce(`registration-flow`, review, () => {
      const box = el(`section`, `xa-registration-flow`);
      box.innerHTML = `<div class="xa-section-label">ماذا يحدث بعد الخطوة التالية؟</div><div><span><b>1</b> ترسل طلب التسجيل</span><i>←</i><span><b>2</b> نتواصل معك عبر واتساب</span><i>←</i><span><b>3</b> يتم تأكيد المقعد</span></div>`;
      return box;
    });
  };

  const enhanceStepSeven = () => {
    const title = qs(`.content-panel > h1`);
    if (title) title.textContent = `أرسل طلب التسجيل`;
    const visualCaption = qs(`.visual-caption p`);
    if (visualCaption) visualCaption.textContent = `وصلنا! أرسل طلب التسجيل، وسنتواصل معك لتأكيد المقعد.`;
    const form = qs(`.register-form`);
    if (form) {
      const lead = qs(`.lead`, form);
      if (lead) {
        const courseName = qs(`.content-panel > .subtitle`)?.textContent || ``;
        lead.innerHTML = `آخر خطوة فقط. أرسل بياناتك لطلب التسجيل في <b>${courseName}</b>. سنتواصل معك عبر واتساب لتأكيد توفر المقعد وإكمال التسجيل.`;
      }
      const submit = qs(`button.submit`, form);
      if (submit) {
        if (submit.textContent.includes(`جاري تثبيت المقعد`)) {
          submit.childNodes[0].textContent = `جاري إرسال الطلب… `;
        } else if (!submit.textContent.includes(`جاري`)) {
          submit.childNodes[0].textContent = `إرسال طلب التسجيل `;
        }
      }
      const privacy = qs(`.privacy`, form);
      if (privacy) privacy.textContent = `نستخدم بياناتك للتواصل معك بخصوص التسجيل والدورة.`;
    }

    const registered = qs(`.registered`);
    if (registered) {
      const title = qs(`h2`, registered);
      const copy = qs(`p`, registered);
      if (title) title.textContent = `تم استلام طلب التسجيل`;
      if (copy) copy.textContent = `وصلتنا بياناتك. سنتواصل معك عبر واتساب لتأكيد توفر المقعد وإكمال التسجيل.`;
    }
  };

  const enhanceContextualHelp = (step) => {
    const content = qs(`.step-content`);
    if (!content || [0, 6, 7].includes(step)) return;
    addOnce(`context-help-${step}`, content, () => {
      const details = el(`details`, `xa-context-help`);
      const contentByStep = {
        1: [`عندي سؤال قبل ما أكمل`, `إذا كان سؤالك عن مستوى الدورة، طريقة التدريب أو ما تحتاجه قبل البداية، اسأل المدرب مباشرة.`],
        2: [`كيف أعرف أن هذه النتائج تناسب شغلي؟`, `قارن النتائج بمهماتك اليومية. إذا بقي عندك شك، اذكر طبيعة شغلك وسنساعدك تحدد الملاءمة.`],
        3: [`المصطلحات جديدة عليّ`, `هذا طبيعي؛ أسماء الأدوات ليست الهدف. ركز على سؤال العمل المكتوب تحت كل جزء من المنهج.`],
        4: [`عندي سؤال عن الجدول`, `إذا عندك تعارض أو سؤال عن الغياب والتسجيلات، اسأل قبل إرسال طلب التسجيل.`],
        5: [`عندي سؤال عن الرسوم أو ما يشمله البرنامج`, `القائمة أعلاه توضح العناصر المشمولة حالياً. لأي تفصيل إضافي تواصل معنا مباشرة.`]
      };
      const [title, answer] = contentByStep[step] || [`عندي سؤال`, `تواصل معنا وسنساعدك.`];
      details.innerHTML = `<summary>${title}<span aria-hidden="true">+</span></summary><div><p>${answer}</p><a href="${CONFIG.whatsapp}" target="_blank" rel="noreferrer">اسأل على واتساب ←</a></div>`;
      return details;
    });
  };

  const enhance = () => {
    const step = getStep();
    if (step === null) return;
    document.body.dataset.xaStep = String(step);
    state.lastStep = step;

    if (step === 0) enhanceStepZero();
    if (step === 1) enhanceStepOne();
    if (step === 2) enhanceStepTwo();
    if (step === 3) enhanceStepThree();
    if (step === 4) enhanceStepFour();
    if (step === 5) enhanceStepFive();
    if (step === 6) enhanceStepSix();
    if (step === 7) enhanceStepSeven();

    enhanceContextualHelp(step);
    updateAccessibleLabels();
  };

  let raf = 0;
  const scheduleEnhance = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(enhance);
  };

  const observer = new MutationObserver(scheduleEnhance);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: [`class`] });
  window.addEventListener(`load`, scheduleEnhance, { once: true });
  scheduleEnhance();
})();
