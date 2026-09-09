/* ==========================================================================
   pages/employees.js — directory, filters, CRUD, profile drawer
   ========================================================================== */
(function (EVA) {
  "use strict";

  var U = EVA.utils,
    ui = EVA.ui,
    icon = EVA.icon;
  var S = EVA.services;

  var state = {
    search: "",
    department: "all",
    role: "all",
    status: "all",
    sort: "name",
    dir: "asc",
    view: "table",
  };

  /* ---------------- form ---------------- */

  function formHtml(emp, errors) {
    errors = errors || {};
    var e = emp || {};
    return (
      '<form id="empForm" novalidate>' +
      '<div class="photo-picker" style="margin-bottom:18px">' +
      '<div class="photo-picker__preview" data-photo-preview>' +
      (e.photo
        ? '<img src="' + U.attr(e.photo) + '" alt="">'
        : icon("image", { size: 22 })) +
      "</div>" +
      '<div class="photo-picker__actions" style="flex:1">' +
      ui.imageUpload({
        label: "Profile photo",
        name: "photo",
        value: e.photo || "",
        hint: "Leave empty to use initials on a lime tile.",
      }) +
      "</div>" +
      "</div>" +
      '<div class="field-row">' +
      ui.field({
        label: "Full name",
        name: "name",
        value: e.name || "",
        required: true,
        placeholder: "e.g. Priya Sharma",
        error: errors.name,
        autofocus: true,
      }) +
      ui.field({
        label: "Employee ID",
        name: "employeeId",
        value: e.employeeId || S.employees.nextEmployeeId(),
        required: true,
        error: errors.employeeId,
      }) +
      "</div>" +
      '<div class="field-row">' +
      ui.field({
        label: "Role",
        name: "role",
        value: e.role || "",
        required: true,
        placeholder: "e.g. Sales Lead",
        error: errors.role,
      }) +
      ui.field({
        type: "select",
        label: "Category",
        name: "category",
        value: e.category || "Employee",
        required: true,
        placeholder: "Employee type",
        options: [
          { value: "Employee", label: "Employee" },
          { value: "Intern", label: "Intern" },
        ],
        error: errors.category,
      }) +
      "</div>" +
      '<div class="field-row">' +
      ui.field({
        type: "select",
        label: "Department",
        name: "department",
        value: e.department || "",
        required: true,
        placeholder: "Select department",
        options: S.employees.departments(),
        error: errors.department,
      }) +
      ui.field({
        label: "Branch location",
        name: "branchLocation",
        value: e.branchLocation || "",
        placeholder: "e.g. Chennai Office",
      }) +
      "</div>" +
      '<div class="field-row">' +
      ui.field({
        type: "date",
        label: "Birthday",
        name: "birthday",
        value: e.birthday || "",
        required: true,
        error: errors.birthday,
      }) +
      ui.field({
        type: "date",
        label: "Joining date",
        name: "joiningDate",
        value: e.joiningDate || "",
        error: errors.joiningDate,
      }) +
      "</div>" +
      '<div class="field-row">' +
      ui.field({
        type: "email",
        label: "Work email",
        name: "email",
        value: e.email || "",
        placeholder: "name@askeva.io",
        error: errors.email,
      }) +
      ui.field({
        type: "select",
        label: "Status",
        name: "status",
        value: e.status || "active",
        options: [
          { value: "active", label: "Active" },
          { value: "on-leave", label: "On leave" },
          { value: "inactive", label: "Inactive" },
        ],
      }) +
      "</div>" +
      "</form>"
    );
  }

  function openForm(id, onSaved) {
    var emp = id ? S.employees.get(id) : null;
    var ctrl = ui.modal({
      title: emp ? "Edit employee" : "Add employee",
      sub: emp
        ? "Update the directory record for " + emp.name
        : "New people appear on the TV for birthdays and recognition.",
      icon: emp ? "edit" : "user-plus",
      size: "lg",
      body: formHtml(emp),
      foot:
        '<button class="btn btn--soft" type="button" data-close>Cancel</button>' +
        '<button class="btn btn--soft" type="button" data-save>' +
        icon(emp ? "save" : "plus", { size: 16 }) +
        (emp ? "Save changes" : "Add employee") +
        "</button>" +
        '<button class="btn btn--primary" type="button" data-save-and-push>' +
        icon("send", { size: 16 }) +
        (emp ? "Save & Push to TV" : "Add & Push to TV") +
        "</button>",
      onMount: function (c) {
        var form = c.el.querySelector("#empForm");
        var preview = c.el.querySelector("[data-photo-preview]");

        form.elements.photo.addEventListener("input", function () {
          var v = this.value.trim();
          preview.innerHTML = v
            ? '<img src="' + U.attr(v) + '" alt="" onerror="this.remove()">'
            : icon("image", { size: 22 });
        });

        form.addEventListener("submit", function (ev) {
          ev.preventDefault();
          save(false);
        });
        form.addEventListener("keydown", function (ev) {
          if (ev.key === "Enter" && ev.target.tagName !== "TEXTAREA") {
            ev.preventDefault();
            save(false);
          }
        });
        c.el
          .querySelector("[data-save]")
          .addEventListener("click", function () {
            save(false);
          });
        c.el
          .querySelector("[data-save-and-push]")
          .addEventListener("click", function () {
            save(true);
          });

        function save(andPush) {
          var data = ui.readForm(form);
          var check = S.employees.validate(data, id);
          if (!check.valid) {
            ui.showErrors(form, check.errors);
            ui.toast.error("Check the highlighted fields");
            return;
          }
          var savedEmp;
          if (emp) {
            savedEmp = S.employees.update(id, check.data);
            ui.toast.success(
              "Employee updated",
              check.data.name + " has been saved.",
            );
          } else {
            savedEmp = S.employees.create(check.data);
            ui.toast.success(
              "Employee added",
              check.data.name + " is now in the directory.",
            );
          }
          c.close();
          if (onSaved) onSaved();
          EVA.app.refresh();
          if (andPush && savedEmp) {
            setTimeout(function () {
              openPushToTv(savedEmp.id);
            }, 120);
          }
        }
      },
    });
    return ctrl;
  }

  /* ---------------- push to tv dialog ---------------- */

  function openRandomPushToTv() {
    var eligible = S.employees.all().filter(function (emp) {
      return emp.status !== "inactive";
    });
    if (!eligible.length) {
      ui.toast.error(
        "No employees available",
        "Add an active employee before pushing to TV.",
      );
      return;
    }
    var employee = eligible[Math.floor(Math.random() * eligible.length)];
    openPushToTv(employee.id);
  }

  function openPushToTv(id) {
    var emp = S.employees.get(id);
    if (!emp) return;
    var wish = S.birthdays.wishFor(id);
    var defaultMsg = wish ? wish.message : S.birthdays.defaultMessage(emp);

    var body =
      '<form id="pushTvForm">' +
      '<div style="display:flex;gap:16px;align-items:center;padding:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;margin-bottom:18px">' +
      '<div id="push_photo_preview" style="flex-shrink:0">' +
      (emp.photo
        ? '<img src="' +
          U.attr(emp.photo) +
          '" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:2.5px solid #C7F53F;display:block">'
        : '<div style="width:72px;height:72px;border-radius:50%;background:#C7F53F;color:#08150E;font-size:26px;font-weight:800;display:grid;place-items:center">' +
          U.esc(U.initials(emp.name)) +
          "</div>") +
      "</div>" +
      '<div style="min-width:0;flex:1">' +
      '<div style="font-size:17px;font-weight:700;color:#fff">' +
      U.esc(emp.name) +
      "</div>" +
      '<div style="font-size:13.5px;color:rgba(255,255,255,0.7);margin-top:2px">' +
      U.esc(emp.role) +
      " · " +
      U.esc(emp.department) +
      "</div>" +
      '<div style="font-size:12px;color:#C7F53F;margin-top:5px;display:flex;align-items:center;gap:5px">' +
      icon("tv", { size: 14 }) +
      " Will be broadcast to TV with photo</div>" +
      "</div>" +
      "</div>" +
      ui.imageUpload({
        label: "Photo for TV spotlight",
        name: "photo",
        value: emp.photo || "",
        hint: "Keep or upload a photo that will appear on the TV screen.",
      }) +
      ui.field({
        type: "textarea",
        label: "Celebration Message",
        name: "message",
        required: true,
        rows: 3,
        maxlength: 200,
        value: defaultMsg,
        hint: "Appears underneath their name on the TV celebration card.",
      }) +
      "</form>";

    ui.modal({
      title: "Push " + emp.name + " to TV",
      sub: "Broadcast this employee immediately to the office TV display",
      icon: "send",
      size: "md",
      body: body,
      foot:
        '<button class="btn btn--soft" type="button" data-close>Cancel</button>' +
        '<button class="btn btn--soft" type="button" data-preview>' +
        icon("eye", { size: 16 }) +
        "Preview slide</button>" +
        '<button class="btn btn--primary" type="button" data-push>' +
        icon("send", { size: 16 }) +
        "Push to TV</button>",
      onMount: function (c) {
        var form = c.el.querySelector("#pushTvForm");
        var photoInput = form.elements.photo;
        var previewTarget = c.el.querySelector("#push_photo_preview");

        if (photoInput) {
          photoInput.addEventListener("input", function () {
            var val = this.value.trim();
            if (val && previewTarget) {
              previewTarget.innerHTML =
                '<img src="' +
                U.attr(val) +
                '" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:2.5px solid #C7F53F;display:block">';
            }
          });
        }

        c.el
          .querySelector("[data-preview]")
          .addEventListener("click", function () {
            var d = ui.readForm(form);
            var photoVal = d.photo || emp.photo || "";
            EVA.publish.preview({
              title: "Slide preview",
              sub: "How " + emp.name + " will look on the office TV",
              hidePublish: true,
              autoplay: false,
              slides: [
                {
                  id: "tmp_emp",
                  type: "birthday",
                  duration: 12,
                  label: "Spotlight — " + emp.name,
                  data: {
                    name: emp.name,
                    role: emp.role,
                    department: emp.department,
                    photo: photoVal,
                    initials: U.initials(emp.name),
                    message: d.message || defaultMsg,
                  },
                },
              ],
            });
          });

        c.el
          .querySelector("[data-push]")
          .addEventListener("click", function () {
            var d = ui.readForm(form);
            var photoVal = d.photo || emp.photo || "";
            var msg = String(d.message || defaultMsg).trim();

            if (photoVal !== emp.photo) {
              S.employees.update(
                emp.id,
                Object.assign({}, emp, { photo: photoVal }),
              );
            }

            var existingWish = S.birthdays.wishFor(emp.id);
            if (existingWish) {
              S.birthdays.saveMessage(existingWish.id, msg, photoVal);
              S.birthdays.publish(existingWish.id);
            } else {
              var created = S.birthdays.create({
                employeeId: emp.id,
                message: msg,
                photo: photoVal,
                status: "published",
              });
              S.birthdays.publish(created.id);
            }

            S.tv.publish({
              birthdayEmployeeId: emp.id,
              reason:
                "<strong>" +
                U.esc(emp.name) +
                "</strong> pushed to the TV with photo",
            });

            c.close();
            EVA.publish.success({
              text: emp.name + " is now live on the TV display with photo.",
            });
            EVA.app.refresh();
          });
      },
    });
  }

  /* ---------------- profile drawer ---------------- */

  function openProfile(id) {
    var emp = S.employees.get(id);
    if (!emp) return;

    var wish = S.birthdays.wishFor(id);
    var recognitions = S.performers.all().filter(function (p) {
      return p.employeeId === id;
    });
    var days = U.daysUntilBirthday(emp.birthday);

    var recogHtml = recognitions.length
      ? recognitions
          .map(function (p) {
            var meta = S.performers.periodMeta(p.period);
            return (
              '<div class="lb-row" style="padding-left:0;padding-right:0">' +
              '<span class="lb-row__rank">' +
              U.pad2(p.rank) +
              "</span>" +
              '<div style="flex:1;min-width:0">' +
              '<div class="person__name">' +
              U.esc(p.title) +
              "</div>" +
              '<div class="person__sub">' +
              U.esc(meta.title) +
              "</div>" +
              "</div>" +
              ui.badge(p.status) +
              "</div>"
            );
          })
          .join("")
      : '<p class="field__hint">No recognition recorded yet.</p>';

    ui.modal({
      title: emp.name,
      sub: emp.role + " · " + emp.department,
      icon: "user",
      size: "lg",
      body:
        '<div class="emp-hero">' +
        ui.avatar(emp, { size: "xl" }) +
        '<div style="min-width:0">' +
        '<div class="emp-hero__name">' +
        U.esc(emp.name) +
        "</div>" +
        '<div class="emp-hero__role">' +
        U.esc(emp.role) +
        "</div>" +
        '<div class="emp-hero__tags">' +
        ui.badge(emp.status) +
        '<span class="chip">' +
        icon("building") +
        U.esc(emp.department) +
        "</span>" +
        '<span class="chip">' +
        icon("hash") +
        U.esc(emp.employeeId) +
        "</span>" +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="divider"></div>' +
        '<div class="rail-label">Details</div>' +
        '<div class="kv"><span class="kv__k">Birthday</span><span class="kv__v">' +
        U.esc(U.formatDay(emp.birthday)) +
        ' <span class="muted">· ' +
        (days === 0 ? "today" : "in " + days + " days") +
        "</span></span></div>" +
        '<div class="kv"><span class="kv__k">Age</span><span class="kv__v">' +
        (U.age(emp.birthday) || "—") +
        "</span></div>" +
        '<div class="kv"><span class="kv__k">Branch</span><span class="kv__v">' +
        U.esc(emp.branchLocation || "Not set") +
        "</span></div>" +
        '<div class="kv"><span class="kv__k">Joined</span><span class="kv__v">' +
        U.esc(U.formatDate(emp.joiningDate)) +
        "</span></div>" +
        '<div class="kv"><span class="kv__k">Tenure</span><span class="kv__v">' +
        U.esc(U.tenure(emp.joiningDate)) +
        "</span></div>" +
        '<div class="kv"><span class="kv__k">Email</span><span class="kv__v">' +
        U.esc(emp.email || "—") +
        "</span></div>" +
        '<div class="divider"></div>' +
        '<div class="rail-label">Birthday message</div>' +
        (wish
          ? '<div class="bday__msg" style="margin:0">' +
            '<div class="bday__msg-head"><span>Message ' +
            (wish.status === "published" ? "· live on TV" : "· draft") +
            "</span></div>" +
            U.esc(wish.message) +
            "</div>"
          : '<p class="field__hint">No message written yet — the default template will be used.</p>') +
        '<div class="divider"></div>' +
        '<div class="rail-label">Recognition</div>' +
        recogHtml,
      foot:
        '<button class="btn btn--danger btn--sm" type="button" data-del>' +
        icon("trash", { size: 15 }) +
        "Delete</button>" +
        '<div style="flex:1"></div>' +
        '<button class="btn btn--soft" type="button" data-close>Close</button>' +
        '<button class="btn btn--soft" type="button" data-edit>' +
        icon("edit", { size: 16 }) +
        "Edit</button>" +
        '<button class="btn btn--primary" type="button" data-push-tv>' +
        icon("send", { size: 16 }) +
        "Push to TV</button>",
      onMount: function (c) {
        c.el
          .querySelector("[data-push-tv]")
          .addEventListener("click", function () {
            c.close();
            openPushToTv(id);
          });
        c.el
          .querySelector("[data-edit]")
          .addEventListener("click", function () {
            c.close();
            openForm(id);
          });
        c.el.querySelector("[data-del]").addEventListener("click", function () {
          c.close();
          confirmDelete(id);
        });
      },
    });
  }

  function confirmDelete(id) {
    var emp = S.employees.get(id);
    if (!emp) return;
    ui.confirm({
      title: "Delete " + emp.name + "?",
      html:
        "This removes the employee from the directory along with their birthday message and recognition cards. " +
        "<strong>This cannot be undone.</strong>",
      confirmLabel: "Delete employee",
      tone: "danger",
    }).then(function (ok) {
      if (!ok) return;
      S.employees.remove(id);
      ui.toast.success("Employee deleted", emp.name + " was removed.");
      EVA.app.refresh();
    });
  }

  /* ---------------- list rendering ---------------- */

  function openRoleModal() {
    ui.modal({
      title: "Add Role",
      sub: "Create a new role bucket for the employee directory.",
      icon: "plus",
      size: "sm",
      body:
        '<form id="roleForm" novalidate>' +
        ui.field({
          label: "Role name",
          name: "roleName",
          placeholder: "e.g. Developers",
          autofocus: true,
        }) +
        "</form>",
      foot:
        '<button class="btn btn--soft" type="button" data-close>Cancel</button>' +
        '<button class="btn btn--primary" type="button" data-role-save>' +
        icon("plus", { size: 16 }) +
        "Add role</button>",
      onMount: function (c) {
        c.el
          .querySelector("[data-role-save]")
          .addEventListener("click", function () {
            var form = c.el.querySelector("#roleForm");
            var name = (
              form && form.elements.roleName ? form.elements.roleName.value : ""
            ).trim();
            if (!name) {
              ui.toast.error(
                "Role name required",
                "Add a name before creating the role.",
              );
              return;
            }

            var saved = S.employees.addRole(name);
            if (!saved) {
              ui.toast.info(
                "Role already exists",
                "This role is already in your directory.",
              );
              return;
            }

            c.close();
            state.role = name;
            EVA.app.refresh();
            ui.toast.success(
              "Role added",
              "The new role is now available in the directory.",
            );
          });
      },
    });
  }

  function roleCardsHtml() {
    var roles = S.employees.roles();
    if (!roles.length) return "";

    return (
      '<div class="role-scroll">' +
      '<div class="role-grid">' +
      roles
        .map(function (role) {
          var count = S.employees.query({ role: role }).length;
          var isActive = state.role === role;
          return (
            '<button class="role-card' +
            (isActive ? " is-selected" : "") +
            '" type="button" data-role-card="' +
            U.attr(role) +
            '">' +
            '<div class="role-card__head">' +
            '<span class="role-card__icon">' +
            icon("users", { size: 14 }) +
            "</span>" +
            '<span class="role-card__arrow">' +
            icon("arrow-right", { size: 15 }) +
            "</span>" +
            "</div>" +
            '<div class="role-card__title">' +
            U.esc(role) +
            "</div>" +
            '<div class="role-card__meta"><strong>' +
            U.esc(String(count)) +
            "</strong> employees</div>" +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      "</div>"
    );
  }

  function toolbar() {
    var deps = S.employees.departments();
    var roles = S.employees.roles();
    var filtered =
      state.department !== "all" ||
      state.role !== "all" ||
      state.status !== "all";

    function sel(name, value, options, label) {
      return (
        '<div class="select-wrap">' +
        '<select class="select' +
        (value !== "all" ? " is-filtered" : "") +
        '" data-filter="' +
        name +
        '">' +
        '<option value="all">' +
        U.esc(label) +
        "</option>" +
        options
          .map(function (o) {
            var v = typeof o === "string" ? o : o.value;
            var l = typeof o === "string" ? o : o.label;
            return (
              '<option value="' +
              U.attr(v) +
              '"' +
              (v === value ? " selected" : "") +
              ">" +
              U.esc(l) +
              "</option>"
            );
          })
          .join("") +
        "</select>" +
        icon("chevron-down", { size: 14 }) +
        "</div>"
      );
    }

    return (
      '<div class="toolbar">' +
      '<div class="toolbar__search">' +
      icon("search") +
      '<input type="search" data-search data-focus-key="empSearch" placeholder="Search name, role, ID…" value="' +
      U.attr(state.search) +
      '">' +
      "</div>" +
      sel("department", state.department, deps, "All departments") +
      sel(
        "status",
        state.status,
        [
          { value: "active", label: "Active" },
          { value: "on-leave", label: "On leave" },
          { value: "inactive", label: "Inactive" },
        ],
        "Any status",
      ) +
      (filtered || state.search
        ? '<button class="btn btn--ghost btn--sm" type="button" data-clear>' +
          icon("x", { size: 14 }) +
          "Clear</button>"
        : "") +
      '<div class="toolbar__spacer"></div>' +
      '<div class="toolbar__view-actions">' +
      '<div class="segment">' +
      '<button class="segment__btn' +
      (state.view === "table" ? " is-active" : "") +
      '" type="button" data-view="table">' +
      icon("list", { size: 14 }) +
      "Table</button>" +
      '<button class="segment__btn' +
      (state.view === "cards" ? " is-active" : "") +
      '" type="button" data-view="cards">' +
      icon("dashboard", { size: 14 }) +
      "Cards</button>" +
      "</div>" +
      '<button class="btn btn--primary btn--sm" type="button" data-add>' +
      icon("user-plus", { size: 15 }) +
      "Add employee</button>" +
      "</div>" +
      "</div>"
    );
  }

  function th(key, label) {
    var sorted = state.sort === key;
    return (
      '<th class="is-sortable' +
      (sorted ? " is-sorted" : "") +
      '" data-sort="' +
      key +
      '">' +
      '<span class="th-inner">' +
      U.esc(label) +
      icon(
        sorted ? (state.dir === "asc" ? "chevron-up" : "chevron-down") : "sort",
        { size: 12 },
      ) +
      "</span></th>"
    );
  }

  function tableView(rows) {
    if (!rows.length) return emptyState();
    return (
      '<div class="table-wrap"><div class="table-scroll"><table class="table">' +
      "<thead><tr>" +
      th("name", "Employee") +
      th("employeeId", "ID") +
      th("role", "Role") +
      th("department", "Department") +
      th("birthday", "Birthday") +
      th("joiningDate", "Joined") +
      "<th>Status</th><th>Actions</th>" +
      "</tr></thead><tbody>" +
      rows
        .map(function (e) {
          var days = U.daysUntilBirthday(e.birthday);
          return (
            '<tr data-id="' +
            U.attr(e.id) +
            '">' +
            "<td>" +
            ui.person(e, { sub: e.email }) +
            "</td>" +
            '<td><span class="table__id">' +
            U.esc(e.employeeId) +
            "</span></td>" +
            "<td>" +
            U.esc(e.role) +
            "</td>" +
            "<td>" +
            U.esc(e.department) +
            "</td>" +
            "<td>" +
            U.esc(U.formatDay(e.birthday, true)) +
            (days === 0
              ? ' <span class="badge badge--lime">Today</span>'
              : "") +
            "</td>" +
            '<td class="muted">' +
            U.esc(U.formatDate(e.joiningDate, true)) +
            "</td>" +
            "<td>" +
            ui.badge(e.status) +
            "</td>" +
            '<td><span class="table__actions">' +
            '<button class="btn btn--xs btn--primary tooltip-host" data-tip="Push to TV with photo" data-act="push-tv">' +
            icon("send", { size: 12 }) +
            " Push</button>" +
            '<button class="btn btn--xs btn--soft btn--icon tooltip-host" data-tip="View" data-act="view">' +
            icon("eye", { size: 13 }) +
            "</button>" +
            '<button class="btn btn--xs btn--soft btn--icon tooltip-host" data-tip="Edit" data-act="edit">' +
            icon("edit", { size: 13 }) +
            "</button>" +
            '<button class="btn btn--xs btn--soft btn--icon tooltip-host" data-tip="Delete" data-act="delete">' +
            icon("trash", { size: 13 }) +
            "</button>" +
            "</span></td>" +
            "</tr>"
          );
        })
        .join("") +
      "</tbody></table></div>" +
      '<div class="table-foot">' +
      "<span>Showing <strong>" +
      rows.length +
      "</strong> of " +
      S.employees.stats().total +
      " employees</span>" +
      '<span class="mono">Sorted by ' +
      U.esc(state.sort) +
      " · " +
      state.dir +
      "</span>" +
      "</div></div>"
    );
  }

  function cardsView(rows) {
    if (!rows.length) return emptyState();
    return (
      '<div class="grid grid--cards">' +
      rows
        .map(function (e) {
          var days = U.daysUntilBirthday(e.birthday);
          return (
            '<article class="card card--hover" data-id="' +
            U.attr(e.id) +
            '">' +
            '<div class="card__body">' +
            '<div style="display:flex;gap:13px;align-items:flex-start">' +
            ui.avatar(e, { size: "lg" }) +
            '<div style="min-width:0;flex:1">' +
            '<div class="person__name" style="font-size:15px">' +
            U.esc(e.name) +
            "</div>" +
            '<div class="person__sub">' +
            U.esc(e.role) +
            "</div>" +
            '<div style="margin-top:9px">' +
            ui.badge(e.status) +
            "</div>" +
            "</div>" +
            "</div>" +
            '<div class="divider" style="margin:14px 0"></div>' +
            '<div class="kv" style="padding:5px 0"><span class="kv__k">Dept</span><span class="kv__v">' +
            U.esc(e.department) +
            "</span></div>" +
            '<div class="kv" style="padding:5px 0"><span class="kv__k">Branch</span><span class="kv__v">' +
            U.esc(e.branchLocation || "Not set") +
            "</span></div>" +
            '<div class="kv" style="padding:5px 0"><span class="kv__k">ID</span><span class="kv__v mono">' +
            U.esc(e.employeeId) +
            "</span></div>" +
            '<div class="kv" style="padding:5px 0"><span class="kv__k">Birthday</span><span class="kv__v">' +
            U.esc(U.formatDay(e.birthday, true)) +
            (days === 0 ? " 🎂" : "") +
            "</span></div>" +
            "</div>" +
            '<div class="card__foot">' +
            '<span class="mono muted">' +
            U.esc(U.tenure(e.joiningDate)) +
            "</span>" +
            '<span class="btn-group">' +
            '<button class="btn btn--xs btn--primary" data-act="push-tv">' +
            icon("send", { size: 12 }) +
            "Push</button>" +
            '<button class="btn btn--xs btn--soft" data-act="view">View</button>' +
            '<button class="btn btn--xs btn--soft btn--icon" data-act="edit">' +
            icon("edit", { size: 13 }) +
            "</button>" +
            '<button class="btn btn--xs btn--soft btn--icon" data-act="delete">' +
            icon("trash", { size: 13 }) +
            "</button>" +
            "</span>" +
            "</div>" +
            "</article>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function emptyState() {
    var filtering =
      state.search ||
      state.department !== "all" ||
      state.role !== "all" ||
      state.status !== "all";
    return (
      '<div class="card card--soft"><div class="card__body">' +
      ui.empty({
        icon: filtering ? "search" : "users",
        title: filtering
          ? "No employees match those filters"
          : "The directory is empty",
        text: filtering
          ? "Try a different search term, or clear the filters to see everyone."
          : "Add your first employee to start celebrating birthdays and recognising great work on the office TV.",
        actions: filtering
          ? '<button class="btn btn--soft" type="button" data-clear>Clear filters</button>'
          : '<button class="btn btn--primary" type="button" data-add>' +
            icon("user-plus", { size: 16 }) +
            "Add employee</button>",
      }) +
      "</div></div>"
    );
  }

  /* ---------------- page ---------------- */

  EVA.pages.employees = {
    title: "Employee",

    setSearch: function (term) {
      state.search = term;
    },
    openForm: openForm,
    openPushToTv: openPushToTv,

    render: function (params) {
      // deep link: #/employees/<id> opens the profile after mount
      EVA.pages.employees._openId = params && params[0] ? params[0] : null;

      var rows = S.employees.query(state);
      var stats = S.employees.stats();

      return (
        '<div class="page__head">' +
        '<div class="page__head-text">' +
        '<h1 class="page__title">Employee</h1>' +
        '<p class="page__desc">' +
        stats.total +
        " people across " +
        stats.departments +
        " departments. Birthdays and recognition on the TV are driven by this directory.</p>" +
        "</div>" +
        '<div class="page__actions">' +
        '<button class="btn btn--soft" type="button" data-export>' +
        icon("download", { size: 16 }) +
        "Export CSV</button>" +
        '<button class="btn btn--soft" type="button" data-random-push>' +
        icon("sparkles", { size: 16 }) +
        "Push random employee</button>" +
        "</div>" +
        "</div>" +
        '<div class="page-toolbar">' +
        '<div class="page-toolbar__search">' +
        icon("search") +
        '<input type="search" data-search data-focus-key="empSearch" placeholder="Search roles, employees…" value="' +
        U.attr(state.search) +
        '">' +
        "</div>" +
        '<button class="btn btn--primary btn--sm" type="button" data-add-role>' +
        icon("plus", { size: 15 }) +
        "Add Role</button>" +
        "</div>" +
        roleCardsHtml() +
        toolbar() +
        (state.view === "table" ? tableView(rows) : cardsView(rows))
      );
    },

    mount: function (root) {
      if (EVA.pages.employees._openId) {
        var id = EVA.pages.employees._openId;
        EVA.pages.employees._openId = null;
        if (S.employees.get(id))
          setTimeout(function () {
            openProfile(id);
          }, 60);
      }

      var search = root.querySelector("[data-search]");
      if (search) {
        search.addEventListener(
          "input",
          U.debounce(function () {
            state.search = search.value;
            EVA.app.refresh();
          }, 220),
        );
      }

      Array.prototype.forEach.call(
        root.querySelectorAll("[data-filter]"),
        function (sel) {
          sel.addEventListener("change", function () {
            state[sel.dataset.filter] = sel.value;
            EVA.app.refresh();
          });
        },
      );

      root.addEventListener("click", function (e) {
        var t;

        if ((t = e.target.closest("[data-role-card]"))) {
          var selectedRole = t.dataset.roleCard;
          state.role = state.role === selectedRole ? "all" : selectedRole;
          EVA.app.refresh();
          return;
        }
        if ((t = e.target.closest("[data-add-role]"))) {
          openRoleModal();
          return;
        }
        if ((t = e.target.closest("[data-view]"))) {
          state.view = t.dataset.view;
          EVA.app.refresh();
          return;
        }
        if ((t = e.target.closest("[data-sort]"))) {
          var key = t.dataset.sort;
          if (state.sort === key)
            state.dir = state.dir === "asc" ? "desc" : "asc";
          else {
            state.sort = key;
            state.dir = "asc";
          }
          EVA.app.refresh();
          return;
        }
        if (e.target.closest("[data-clear]")) {
          state.search = "";
          state.department = "all";
          state.role = "all";
          state.status = "all";
          EVA.app.refresh();
          return;
        }
        if (e.target.closest("[data-add]")) {
          openForm(null);
          return;
        }
        if (e.target.closest("[data-export]")) {
          exportCsv();
          return;
        }
        if (e.target.closest("[data-random-push]")) {
          openRandomPushToTv();
          return;
        }

        if ((t = e.target.closest("[data-act]"))) {
          var row = t.closest("[data-id]");
          if (!row) return;
          var empId = row.dataset.id;
          var act = t.dataset.act;
          if (act === "push-tv") openPushToTv(empId);
          else if (act === "view") openProfile(empId);
          else if (act === "edit") openForm(empId);
          else if (act === "delete") confirmDelete(empId);
        }
      });
    },
  };

  function exportCsv() {
    var rows = S.employees.query(state);
    var head = [
      "Employee ID",
      "Name",
      "Role",
      "Department",
      "Birthday",
      "Joining Date",
      "Status",
      "Email",
    ];
    var lines = [head.join(",")].concat(
      rows.map(function (e) {
        return [
          e.employeeId,
          e.name,
          e.role,
          e.department,
          e.birthday,
          e.joiningDate,
          e.status,
          e.email,
        ]
          .map(function (v) {
            return '"' + String(v || "").replace(/"/g, '""') + '"';
          })
          .join(",");
      }),
    );
    var blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "askeva-employees-" + U.today() + ".csv";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 400);
    ui.toast.success(
      "Export ready",
      rows.length + " employees written to CSV.",
    );
  }
})((window.EVA = window.EVA || {}));
