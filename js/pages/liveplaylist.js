/* ==========================================================================
   pages/liveplaylist.js
   ========================================================================== */
(function (EVA) {
  'use strict';

  var S = EVA.services, ui = EVA.ui, U = EVA.utils;
  var filterState = 'today';

  function renderSlideCard(slide, index) {
    var typeColorMap = {
      announcement: '#C7F53F',
      notice: '#C7F53F',
      birthday: '#C7F53F',
      conversion: '#C7F53F',
      event: '#C7F53F',
      recognition: '#C7F53F',
      achievement: '#C7F53F',
      kpi: '#C7F53F',
      performer: '#C7F53F'
    };

    var cat = (slide.data.category || slide.type || 'Slide').toUpperCase();
    var title = slide.data.title || slide.label;
    var sub = slide.data.text || slide.data.description || slide.data.message || '';
    
    if (slide.type === 'birthday') {
       title = 'Happy Birthday, ' + (slide.data.name || '') + '!';
       sub = slide.data.department || 'Engineering';
       cat = 'BIRTHDAY';
    } else if (slide.type === 'achievement') {
       title = 'Congratulations, ' + (slide.data.name || '') + '!';
       sub = slide.data.description || 'Intern to Full-Time Employee';
       cat = 'CONVERSION';
    } else if (slide.type === 'announcement') {
       title = slide.data.title;
       sub = slide.data.text;
       cat = (slide.data.category || 'ANNOUNCEMENT').toUpperCase();
    }

    return `
      <div class="card" style="margin-bottom: 15px; border: 2px solid var(--ink); border-radius: 4px; display: flex; align-items: stretch; background: var(--white); box-shadow: 2px 2px 0 var(--ink);">
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 40px; border-right: 1px dotted var(--ink); padding: 5px;">
          <button class="icon-btn" style="height:20px;" onclick="EVA.pages.liveplaylist.move('${slide.id}', -1)">↑</button>
          <span style="font-weight: bold; font-size: 12px; margin: 4px 0;">${index + 1}</span>
          <button class="icon-btn" style="height:20px;" onclick="EVA.pages.liveplaylist.move('${slide.id}', 1)">↓</button>
        </div>
        <div style="width: 30px; display: flex; align-items: center; justify-content: center; color: #ccc; cursor: grab;">
          <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor"><circle cx="4" cy="4" r="1.5"/><circle cx="8" cy="4" r="1.5"/><circle cx="4" cy="10" r="1.5"/><circle cx="8" cy="10" r="1.5"/><circle cx="4" cy="16" r="1.5"/><circle cx="8" cy="16" r="1.5"/></svg>
        </div>
        <div style="width: 8px; background: ${typeColorMap[slide.type] || '#C7F53F'};"></div>
        <div style="flex: 1; padding: 15px; display: flex; flex-direction: column; justify-content: center;">
          <div style="margin-bottom: 4px; display: flex; align-items: center;">
            <span style="border: 1px solid var(--ink); font-size: 9px; font-weight: bold; padding: 2px 6px; letter-spacing: 1px;">${cat}</span>
            <span style="font-size:11px; color:#666; margin-left: 6px;">${slide.data.name || ''}</span>
          </div>
          <div style="font-weight: bold; font-size: 15px; margin-bottom: 2px;">${title}</div>
          <div style="font-size: 12px; color: #666;">${sub}</div>
        </div>
        <div style="display: flex; align-items: center; padding: 0 15px; gap: 10px;">
          ${slide.status === 'approved' 
            ? `<button class="btn btn--soft btn--sm" style="color: var(--ink-500);" onclick="EVA.pages.liveplaylist.disapprove('${slide.id}')">Disapprove</button>` 
            : `<button class="btn btn--primary btn--sm" onclick="EVA.pages.liveplaylist.approve('${slide.id}')">Approve</button>`}
          <button class="icon-btn" style="background: var(--cream); border-radius: 50%; width: 32px; height: 32px;" onclick="EVA.pages.liveplaylist.preview('${slide.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          <button class="icon-btn" style="background: var(--cream); border-radius: 50%; width: 32px; height: 32px;" onclick="EVA.pages.liveplaylist.remove('${slide.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `;
  }

  function ensureSlides() {
    var b = S.tv.broadcast();
    if (!b.slides) {
      b.slides = S.tv.buildSlides();
      EVA.store.writeDoc('broadcast', b);
    }
    return b.slides;
  }

  function getFilteredSlides(allSlides) {
    if (filterState === 'today') {
      return allSlides.filter(function(s) {
        if (s.type === 'birthday') {
          var empId = s.id.replace('sl_bday_', '');
          var emp = S.employees.get(empId);
          return emp ? (U.daysUntilBirthday(emp.birthday) === 0) : true;
        }
        return true;
      });
    } else if (filterState === 'tomorrow') {
      return allSlides.filter(function(s) {
        if (s.type === 'birthday') {
          var empId = s.id.replace('sl_bday_', '');
          var emp = S.employees.get(empId);
          return emp ? (U.daysUntilBirthday(emp.birthday) === 1) : true;
        }
        return true; 
      });
    } else if (filterState === 'week') {
      return allSlides.filter(function(s) {
        if (s.type === 'birthday') {
          var empId = s.id.replace('sl_bday_', '');
          var emp = S.employees.get(empId);
          return emp ? (U.daysUntilBirthday(emp.birthday) <= 7) : true;
        }
        return true; 
      });
    }
    return allSlides;
  }

  function render() {
    var allSlides = ensureSlides();
    var slides = getFilteredSlides(allSlides);

    var allApproved = slides.length > 0 && slides.every(function(s) { return s.status === 'approved'; });

    var allApprovedCount = slides.filter(function(s) { return s.status === 'approved'; }).length;

    var html = '<div class="live-playlist-container" style="padding: 20px; position: relative; z-index: 1;">';
    
    html += '<div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px;">';
    html += '<div>';
    html += '<h1 style="font-size: 28px; font-weight: bold; margin-bottom: 4px;">Live Playlist</h1>';
    html += '<div style="font-family: monospace; font-size: 11px; color: #666; text-transform: lowercase;">' + allApprovedCount + ' slides broadcasting on TV - drag or use arrows to reorder</div>';
    html += '</div>';
    
    html += '<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">';
    html += '<div class="segment">';
    html += '<button class="segment__btn ' + (filterState === 'today' ? 'is-active is-lime' : '') + '" onclick="EVA.pages.liveplaylist.setFilter(' + "'today'" + ')">Today</button>';
    html += '<button class="segment__btn ' + (filterState === 'tomorrow' ? 'is-active is-lime' : '') + '" onclick="EVA.pages.liveplaylist.setFilter(' + "'tomorrow'" + ')">Tomorrow</button>';
    html += '<button class="segment__btn ' + (filterState === 'week' ? 'is-active is-lime' : '') + '" onclick="EVA.pages.liveplaylist.setFilter(' + "'week'" + ')">This Week</button>';
    html += '</div>';
    if (slides.length > 0) {
      if (allApproved) {
        html += '<button class="btn btn--soft btn--sm" onclick="EVA.pages.liveplaylist.disapproveAll()">Disapprove All</button>';
      } else {
        html += '<button class="btn btn--primary btn--sm" onclick="EVA.pages.liveplaylist.approveAll()">Approve All</button>';
      }
    }
    html += '</div>';
    html += '</div>';
    
    html += '<div id="playlist-slides">';
    if (slides.length === 0) {
      html += '<div style="text-align:center; padding: 40px; color: #888;">No slides to approve for ' + filterState + '.</div>';
    } else {
      slides.forEach(function (slide, i) {
        html += renderSlideCard(slide, i);
      });
    }
    html += '</div></div>';
    return html;
  }

  function setFilter(f) {
    filterState = f;
    EVA.app.refresh();
  }

  function syncSourceStatus(slide, isApproved) {
    var parts = slide.id.split('_');
    if (parts.length < 3) return;
    var prefix = parts[1];
    var recId = parts.slice(2).join('_');

    try {
      if (prefix === 'bday' && S.birthdays) {
        var wish = S.birthdays.wishFor(recId);
        if (wish) isApproved ? S.birthdays.publish(wish.id) : S.birthdays.unpublish(wish.id);
      } else if (prefix === 'perf' && S.performers) {
        isApproved ? S.performers.publish(recId) : S.performers.unpublish(recId);
      } else if (prefix === 'ann' && S.announcements) {
        isApproved ? S.announcements.publish(recId) : S.announcements.unpublish(recId);
      } else if (prefix === 'evt' && S.events) {
        isApproved ? S.events.publish(recId) : S.events.unpublish(recId);
      } else if (prefix === 'ach' && S.achievements) {
        isApproved ? S.achievements.publish(recId) : S.achievements.unpublish(recId);
      } else if (prefix === 'kpi' && S.salesKpis) {
        isApproved ? S.salesKpis.publish(recId) : S.salesKpis.unpublish(recId);
      }
    } catch(e) {
      // safely ignore if unpublish/publish not implemented
    }
  }

  function approveSlide(id) {
    var slides = ensureSlides();
    var b = S.tv.broadcast();
    var s = b.slides.find(function(x) { return x.id === id; });
    if (s) {
      s.status = 'approved';
      syncSourceStatus(s, true);
      
      b.live = b.slides.some(function(x) { return x.status === 'approved'; });
      b.publishedAt = new Date().toISOString();
      
      b.revision = (b.revision || 0) + 1;
      EVA.store.writeDoc('broadcast', b);
      ui.toast.success("Slide approved!");
      EVA.app.refresh();
    }
  }

  function disapproveSlide(id) {
    var slides = ensureSlides();
    var b = S.tv.broadcast();
    var s = b.slides.find(function(x) { return x.id === id; });
    if (s) {
      s.status = 'pending';
      syncSourceStatus(s, false);
      
      b.live = b.slides.some(function(x) { return x.status === 'approved'; });
      if (b.live) b.publishedAt = new Date().toISOString();
      else b.publishedAt = null;
      
      b.revision = (b.revision || 0) + 1;
      EVA.store.writeDoc('broadcast', b);
      ui.toast.success("Slide disapproved!");
      EVA.app.refresh();
    }
  }

  function approveAll() {
    var slides = ensureSlides();
    var b = S.tv.broadcast();
    var filtered = getFilteredSlides(b.slides);
    filtered.forEach(function(s) { 
      s.status = 'approved'; 
      syncSourceStatus(s, true);
    });
    b.live = true;
    b.publishedAt = new Date().toISOString();
    b.revision = (b.revision || 0) + 1;
    EVA.store.writeDoc('broadcast', b);
    ui.toast.success("Approved all filtered slides!");
    EVA.app.refresh();
  }

  function disapproveAll() {
    var slides = ensureSlides();
    var b = S.tv.broadcast();
    var filtered = getFilteredSlides(b.slides);
    filtered.forEach(function(s) { 
      s.status = 'pending'; 
      syncSourceStatus(s, false);
    });
    // Check if any slides in general are still approved
    b.live = b.slides.some(function(s) { return s.status === 'approved'; });
    if (b.live) {
       b.publishedAt = new Date().toISOString();
    } else {
       b.publishedAt = null;
    }
    b.revision = (b.revision || 0) + 1;
    EVA.store.writeDoc('broadcast', b);
    ui.toast.success("Disapproved all filtered slides!");
    EVA.app.refresh();
  }

  function moveSlide(id, dir) {
    var slides = ensureSlides();
    var b = S.tv.broadcast();
    var i = b.slides.findIndex(function(s) { return s.id === id; });
    if (i < 0) return;
    var target = i + dir;
    if (target < 0 || target >= b.slides.length) return;
    var temp = b.slides[i];
    b.slides[i] = b.slides[target];
    b.slides[target] = temp;
    b.revision = (b.revision || 0) + 1;
    EVA.store.writeDoc('broadcast', b);
    ui.toast.success("Reordered slide");
    EVA.app.refresh();
  }
  
  function removeSlide(id) {
    var b = S.tv.broadcast();
    if (!b.slides) return;
    b.slides = b.slides.filter(function(s) { return s.id !== id; });
    b.revision = (b.revision || 0) + 1;
    EVA.store.writeDoc('broadcast', b);
    ui.toast.success("Slide removed");
    EVA.app.refresh();
  }

  function previewSlide(id) {
    var slides = S.tv.liveSlides();
    if (!slides || !slides.length) {
      slides = S.tv.buildSlides();
    }
    var s = slides.find(function(x) { return x.id === id; });
    if(s) {
       EVA.publish.preview({
         title: 'Slide preview', sub: 'Previewing selected slide',
         hidePublish: true, autoplay: false, slides: [s]
       });
    }
  }

  EVA.pages.liveplaylist = {
    title: 'Live Playlist',
    render: render,
    move: moveSlide,
    remove: removeSlide,
    setFilter: setFilter,
    approve: approveSlide,
    disapprove: disapproveSlide,
    approveAll: approveAll,
    disapproveAll: disapproveAll,
    preview: previewSlide
  };

})(window.EVA = window.EVA || {});
