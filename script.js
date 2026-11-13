(() => {
      'use strict';
      const $ = id => document.getElementById(id);
      const screens = ['home', 'personal', 'guarantor', 'calculating', 'result'];
      const stepMap = { home: 0, personal: 1, guarantor: 2, calculating: 3, result: 3 };
      let currentScreen = 'home';
      let calculationTimer = null;

      function showScreen(id) {
        if (!screens.includes(id)) return;
        clearTimeout(calculationTimer);
        calculationTimer = null;
        currentScreen = id;
        screens.forEach(screen => { $(screen).hidden = screen !== id; });
        document.querySelectorAll('[data-step]').forEach(item => {
          const step = Number(item.dataset.step);
          item.classList.toggle('active', step === stepMap[id]);
          item.classList.toggle('done', step < stepMap[id]);
          if (step === stepMap[id]) item.setAttribute('aria-current', 'step');
          else item.removeAttribute('aria-current');
        });
        const heading = $(id).querySelector('h2');
        if (heading && id !== 'home') heading.focus({ preventScroll: true });
        if (id === 'home') $('start').focus({ preventScroll: true });
        if (window.matchMedia('(max-width: 800px)').matches) {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
        $('announcement').textContent = id === 'calculating' || id === 'result' ? heading.textContent : '';
      }

      function errorMessage(input) {
        const value = input.value.trim();
        if (input.id.endsWith('-name')) {
          return value ? '' : (input.id.startsWith('guarantor') ? '请输入担保人姓名' : '请输入姓名');
        }
        return /^\d{17}[\dXx]$/.test(value) ? '' : '请输入正确的身份证号';
      }

      function validateField(input) {
        const message = errorMessage(input);
        const error = $(input.id + '-error');
        error.textContent = message;
        error.hidden = !message;
        input.setAttribute('aria-invalid', message ? 'true' : 'false');
        return !message;
      }

      function validateForm(form) {
        let firstInvalid = null;
        form.querySelectorAll('input').forEach(input => {
          if (!validateField(input) && !firstInvalid) firstInvalid = input;
        });
        if (firstInvalid) {
          firstInvalid.focus();
          $('announcement').textContent = $(firstInvalid.id + '-error').textContent;
          return false;
        }
        form.querySelectorAll('input').forEach(input => {
          input.value = input.id.endsWith('-id') ? input.value.trim().toUpperCase() : input.value.trim();
        });
        return true;
      }

      function resetForm(form) {
        form.reset();
        form.querySelectorAll('input').forEach(input => input.removeAttribute('aria-invalid'));
        form.querySelectorAll('.field-error').forEach(error => { error.hidden = true; error.textContent = ''; });
      }

      document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
          if (input.getAttribute('aria-invalid') === 'true') validateField(input);
        });
      });
      $('start').addEventListener('click', () => showScreen('personal'));
      document.querySelectorAll('[data-back]').forEach(button => {
        button.addEventListener('click', () => showScreen(button.dataset.back));
      });
      $('personal-form').addEventListener('submit', event => {
        event.preventDefault();
        if (currentScreen === 'personal' && validateForm(event.currentTarget)) showScreen('guarantor');
      });
      $('guarantor-form').addEventListener('submit', event => {
        event.preventDefault();
        if (currentScreen !== 'guarantor' || !validateForm(event.currentTarget)) return;
        showScreen('calculating');
        calculationTimer = setTimeout(() => {
          if (currentScreen === 'calculating') showScreen('result');
        }, 2000);
      });
      $('retry').addEventListener('click', () => {
        resetForm($('guarantor-form'));
        showScreen('guarantor');
      });
      $('restart').addEventListener('click', () => {
        resetForm($('personal-form'));
        resetForm($('guarantor-form'));
        showScreen('home');
      });
    })();
