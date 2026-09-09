/* ==========================================================================\n+   pages/settings.js — company and display settings\n+   ========================================================================== */
(function (EVA) {
  'use strict';

  var U = EVA.utils, ui = EVA.ui, icon = EVA.icon;
  var S = EVA.services;

  EVA.pages.settings = {
    title: 'Settings',

    render: function () {
      var settings = S.settings.get();
      return '<div class="page__head">' +
          '<div class="page__head-text">' +
            '<h1 class="page__title">Settings</h1>' +
            '<p class="page__desc">Follow the flow below to configure the office display from top to bottom.</p>' +
          '</div>' +
        '</div>' +
        '<form id="settingsForm" class="settings-flow" novalidate>' +
          '<section class="settings-flow__block settings-flow__block--header">' +
            '<div class="settings-flow__heading"><span class="settings-flow__step">01</span><div><h2>Header</h2><p>Set the identity that appears across your office TV experience.</p></div></div>' +
            '<div class="settings-flow__content">' +
              '<div class="field-row">' +
                ui.field({ label: 'Company name', name: 'companyName', value: settings.companyName, required: true, hint: 'Shown in the TV display header.' }) +
                ui.field({ label: 'Tagline', name: 'tagline', value: settings.tagline, hint: 'A short supporting line beneath the company name.' }) +
              '</div>' +
              ui.field({ type: 'textarea', label: 'Default birthday message', name: 'defaultBirthdayMessage', value: settings.defaultBirthdayMessage, required: true, rows: 2, hint: 'Used when a birthday slide does not include a custom message.' }) +
            '</div>' +
          '</section>' +
          '<section class="settings-flow__block">' +
            '<div class="settings-flow__heading"><span class="settings-flow__step">02</span><div><h2>Appearance</h2><p>Choose the visual direction for your office display.</p></div></div>' +
            '<div class="settings-flow__split">' +
              '<div class="settings-flow__panel"><h3>Light Mode</h3><p>Use a brighter canvas for open offices and daylight viewing.</p>' +
                ui.field({ type: 'select', label: 'Theme', name: 'theme', value: settings.theme, options: [{ value: 'lime-wash', label: 'Lime Wash' }, { value: 'mono', label: 'Mono Ink' }, { value: 'askeva-dark', label: 'AskEVA Dark' }] }) +
              '</div>' +
              '<div class="settings-flow__panel"><h3>Dark Mode</h3><p>Use a focused, high-contrast look for darker spaces.</p>' +
                ui.field({ type: 'select', label: 'Display mode', name: 'displayMode', value: settings.displayMode || 'auto', options: [{ value: 'auto', label: 'Follow display setting' }, { value: 'light', label: 'Always light' }, { value: 'dark', label: 'Always dark' }] }) +
              '</div>' +
            '</div>' +
          '</section>' +
          '<section class="settings-flow__block">' +
            '<div class="settings-flow__heading"><span class="settings-flow__step">03</span><div><h2>Global Typography</h2><p>Keep every slide readable and consistent from a distance.</p></div></div>' +
            '<div class="settings-flow__split">' +
              '<div class="settings-flow__panel"><h3>Font Selection</h3><p>Select the font family used by headings and body copy.</p>' +
                ui.field({ type: 'select', label: 'Font family', name: 'fontFamily', value: settings.fontFamily || 'Space Grotesk', options: [{ value: 'Space Grotesk', label: 'Space Grotesk' }, { value: 'Inter', label: 'Inter' }, { value: 'JetBrains Mono', label: 'JetBrains Mono' }] }) +
              '</div>' +
              '<div class="settings-flow__panel settings-flow__preview"><h3>Font Preview</h3><p class="settings-flow__sample">Your message should stay clear, calm, and easy to read.</p><span>Preview updates after saving.</span></div>' +
            '</div>' +
          '</section>' +
          '<section class="settings-flow__block">' +
            '<div class="settings-flow__heading"><span class="settings-flow__step">04</span><div><h2>Slide Transitions &amp; Animations</h2><p>Set the pace of the playlist and the way one message flows into the next.</p></div></div>' +
            '<div class="settings-flow__split">' +
              '<div class="settings-flow__panel"><h3>Transition Cards</h3><p>Choose how long each card stays on screen before advancing.</p>' +
                ui.field({ type: 'number', label: 'Slide duration (seconds)', name: 'defaultDuration', value: settings.defaultDuration, min: 3, max: 120, required: true, hint: 'Use between 3 and 120 seconds.' }) +
              '</div>' +
              '<div class="settings-flow__panel"><h3>Animation Preview</h3><p>Choose a subtle transition that keeps the display feeling active.</p>' +
                ui.field({ type: 'select', label: 'Transition style', name: 'transition', value: settings.transition || 'fade', options: [{ value: 'fade', label: 'Fade' }, { value: 'slide', label: 'Slide' }, { value: 'none', label: 'None' }] }) +
                ui.field({ type: 'number', label: 'Refresh interval (seconds)', name: 'refreshInterval', value: settings.refreshInterval, min: 5, max: 600, required: true, hint: 'Controls how often the display checks for updates.' }) +
              '</div>' +
            '</div>' +
          '</section>' +
          '<section class="settings-flow__block settings-flow__actions">' +
            '<p>Reset the flow to defaults or save every setting globally for your office TV.</p>' +
            '<div><button class="btn btn--soft" type="button" id="settingsReset">Reset Defaults</button><button class="btn btn--primary" type="submit">' + icon('save', { size: 16 }) + 'Save &amp; Apply Globally</button></div>' +
          '</section>' +
        '</form>';
    },

    mount: function (root) {
      var form = root.querySelector('#settingsForm');
      if (!form) return;
      var reset = root.querySelector('#settingsReset');
      if (reset) reset.addEventListener('click', function () {
        S.settings.reset();
        ui.toast.success('Defaults restored', 'The settings flow has been reset to its original values.');
        EVA.app.refresh();
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var data = ui.readForm(form);
        var result = S.settings.validate(data);
        if (!result.valid) { ui.showErrors(form, result.errors); return; }
        S.settings.save(data);
        ui.toast.success('Settings saved', 'Your office TV defaults have been updated.');
      });
    }
  };
})(window.EVA = window.EVA || {});
