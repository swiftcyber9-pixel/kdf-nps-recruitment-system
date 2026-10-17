
"use strict";

// ============================================
// KDF & NPS RECRUITMENT ASSISTANT
// Preliminary assessment functionality
// ============================================

const applicationForm = document.getElementById("applicationForm");
const serviceSelect = document.getElementById("service");
const roleSelect = document.getElementById("role");
const formMessage = document.getElementById("formMessage");

// Recruitment requirements are configurable.
// Confirm all thresholds against the current official advert.
const recruitmentRules = {
  KDF: {
    "General Duty Recruit": {
      minAge: 18,
      maxAge: 26,
      minGrade: "D"
    },
    "GSO Cadet": {
      minAge: 18,
      maxAge: 26,
      minGrade: "B"
    },
    "Specialist Officer": {
      minAge: 18,
      maxAge: 30,
      minGrade: null
    },
    "Tradesperson / Tradeswoman": {
      minAge: 18,
      maxAge: 30,
      minGrade: null
    }
  },

  NPS: {
    "Police Constable": {
      minAge: 18,
      maxAge: 28,
      minGrade: "D+"
    }
  }
};

// KCSE grades ordered from highest to lowest.
const kcseGrades = [
  "A", "A-", "B+", "B", "B-", "C+", "C",
  "C-", "D+", "D", "D-", "E"
];

function gradeMeetsRequirement(actualGrade, minimumGrade) {
  if (!minimumGrade) {
    return null;
  }

  const actualIndex = kcseGrades.indexOf(actualGrade);
  const minimumIndex = kcseGrades.indexOf(minimumGrade);

  if (actualIndex === -1 || minimumIndex === -1) {
    return false;
  }

  return actualIndex <= minimumIndex;
}

// ============================================
// UPDATE ROLES WHEN SERVICE CHANGES
// ============================================

serviceSelect.addEventListener("change", function () {
  const selectedService = serviceSelect.value;

  roleSelect.innerHTML =
    '<option value="">Select preferred role</option>';

  if (!selectedService || !recruitmentRules[selectedService]) {
    return;
  }

  const roles = Object.keys(recruitmentRules[selectedService]);

  roles.forEach(function (role) {
    const option = document.createElement("option");
    option.value = role;
    option.textContent = role;
    roleSelect.appendChild(option);
  });
});

// ============================================
// GENERATE ASSESSMENT REFERENCE
// ============================================

function generateReference() {
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return "RA-" + Date.now().toString().slice(-8) + "-" + randomPart;
}

// ============================================
// ASSESS APPLICANT
// ============================================

applicationForm.addEventListener("submit", function (event) {
  event.preventDefault();

  formMessage.textContent = "";
  formMessage.style.color = "#263747";

  if (!applicationForm.checkValidity()) {
    applicationForm.reportValidity();
    return;
  }

  const applicant = {
    fullName: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    service: serviceSelect.value,
    role: roleSelect.value,
    age: Number(document.getElementById("age").value),
    kcse: document.getElementById("kcse").value,
    gender: document.getElementById("gender").value,
    height: Number(document.getElementById("height").value)
  };

  const rules = recruitmentRules[applicant.service]?.[applicant.role];

  if (!rules) {
    formMessage.textContent = "Please select a valid service and role.";
    formMessage.style.color = "#b42318";
    return;
  }

  const issues = [];

  if (applicant.age < rules.minAge || applicant.age > rules.maxAge) {
    issues.push(
      "Your age is outside the configured age range for this role."
    );
  }

  const gradeResult = gradeMeetsRequirement(
    applicant.kcse,
    rules.minGrade
  );

  if (gradeResult === false) {
    issues.push(
      "Your KCSE mean grade is below the configured minimum for this role."
    );
  }

  // The NPS height and English/Kiswahili subject requirements,
  // and KDF role-specific height, weight, BMI, medical and
  // specialist qualifications, need additional verification.
  // Do not treat this preliminary result as final eligibility.

  const reference = generateReference();

  const assessment = {
    reference: reference,
    applicant: applicant,
    result: issues.length === 0
      ? "Preliminary requirements met"
      : "Requirements need review",
    issues: issues,
    createdAt: new Date().toISOString()
  };

  displayAssessment(assessment);

  // EmailJS integration will be added in the next step.
});

// ============================================
// DISPLAY ASSESSMENT RESULT
// ============================================

function displayAssessment(assessment) {
  let resultBox = document.getElementById("assessmentResult");

  if (!resultBox) {
    resultBox = document.createElement("section");
    resultBox.id = "assessmentResult";
    resultBox.setAttribute("aria-live", "polite");
    resultBox.style.cssText = [
      "max-width:900px",
      "margin:24px auto 0",
      "padding:24px",
      "border:1px solid #dce4eb",
      "border-radius:12px",
      "background:#ffffff",
      "overflow-wrap:anywhere"
    ].join(";");

    applicationForm.insertAdjacentElement("afterend", resultBox);
  }

  resultBox.replaceChildren();

  const title = document.createElement("h3");
  title.textContent = "Assessment Submitted";
  title.style.color = "#102c46";
  title.style.marginBottom = "12px";
  resultBox.appendChild(title);

  const reference = document.createElement("p");
  reference.textContent = "Reference: " + assessment.reference;
  reference.style.fontWeight = "bold";
  resultBox.appendChild(reference);

  const applicantInfo = document.createElement("p");
  applicantInfo.textContent =
    "Applicant: " + assessment.applicant.fullName;
  resultBox.appendChild(applicantInfo);

  const serviceInfo = document.createElement("p");
  serviceInfo.textContent =
    "Service: " + assessment.applicant.service +
    " | Role: " + assessment.applicant.role;
  resultBox.appendChild(serviceInfo);

  const resultText = document.createElement("p");
  resultText.textContent = assessment.result;
  resultText.style.fontWeight = "bold";
  resultText.style.marginTop = "12px";
  resultBox.appendChild(resultText);

  if (assessment.issues.length > 0) {
    const list = document.createElement("ul");
    list.style.paddingLeft = "22px";

    assessment.issues.forEach(function (issue) {
      const item = document.createElement("li");
      item.textContent = issue;
      list.appendChild(item);
    });

    resultBox.appendChild(list);
  }

  const disclaimer = document.createElement("p");
  disclaimer.textContent =
    "This is an automated preliminary assessment, not an official " +
    "recruitment decision. Final eligibility depends on the current " +
    "official advertisement and verification by the recruiting service.";
  disclaimer.style.cssText =
    "margin-top:16px;font-size:13px;color:#637386";

  resultBox.appendChild(disclaimer);

  resultBox.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}

/* KDF/NPS Applicant Document Portal */

document.addEventListener("DOMContentLoaded", function () {
  const accountMessage = document.getElementById("account-message");
  const uploadMessage = document.getElementById("upload-message");
  const uploadForm = document.getElementById("document-upload-form");
  const uploadButton = document.getElementById("upload-document-button");

  if (
    !window.supabase ||
    typeof supabaseClient === "undefined"
  ) {
    if (accountMessage) {
      accountMessage.textContent =
        "Connection error. Check your Supabase configuration.";
    }
    return;
  }

  const client = supabaseClient;

  // Create an applicant account.
  document
    .getElementById("applicant-signup")
    .addEventListener("click", async function () {
      const email = document
        .getElementById("applicant-email").value.trim();

      const password = document
        .getElementById("applicant-password").value;

      if (!email || password.length < 8) {
        accountMessage.textContent =
          "Enter a valid email and a password of at least 8 characters.";
        return;
      }

      accountMessage.textContent = "Creating account...";

      try {
        const { data, error } = await client.auth.signUp({
          email: email,
          password: password
        });

        if (error) throw error;

        if (data.session) {
          accountMessage.textContent =
            "Account created. You are signed in.";
        } else {
          accountMessage.textContent =
            "Account created. Check your email for a verification link before signing in.";
        }
      } catch (error) {
        accountMessage.textContent =
          "Account creation failed: " + error.message;
      }
    });

  // Sign in an applicant.
  document
    .getElementById("applicant-login")
    .addEventListener("click", async function () {
      const email = document
        .getElementById("applicant-email").value.trim();

      const password = document
        .getElementById("applicant-password").value;

      if (!email || !password) {
        accountMessage.textContent =
          "Enter your email and password.";
        return;
      }

      accountMessage.textContent = "Signing in...";

      try {
        const { error } = await client.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) throw error;

        accountMessage.textContent =
          "Signed in successfully. You can now submit a document.";
      } catch (error) {
        accountMessage.textContent =
          "Sign-in failed: " + error.message;
      }
    });

  // Submit a document through the secure Edge Function.
  uploadForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const { data: sessionData, error: sessionError } =
      await client.auth.getSession();

    if (sessionError || !sessionData.session) {
      uploadMessage.textContent =
        "Please create an account and sign in before submitting.";
      return;
    }

    const file = document.getElementById("applicant-file").files[0];

    if (!file) {
      uploadMessage.textContent = "Please select a file.";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      uploadMessage.textContent =
        "The file must not exceed 5 MB.";
      return;
    }

    if (!document.getElementById("document-consent").checked) {
      uploadMessage.textContent =
        "Please confirm the consent checkbox.";
      return;
    }

    const formData = new FormData();
    formData.append(
      "applicant_name",
      document.getElementById("applicant-name").value.trim()
    );
    formData.append(
      "recruitment_service",
      document.getElementById("recruitment-service").value
    );
    formData.append(
      "recruitment_category",
      document.getElementById("recruitment-category").value.trim()
    );
    formData.append(
      "document_type",
      document.getElementById("document-type").value
    );
    formData.append("file", file);

    uploadButton.disabled = true;
    uploadMessage.textContent = "Submitting document...";

    try {
      const { data, error } = await client.functions.invoke(
        "submit-applicant-document",
        { body: formData }
      );

      if (error) {
        let detail = error.message;

        if (error.context && typeof error.context.json === "function") {
          try {
            const responseBody = await error.context.json();
            if (responseBody.error) detail = responseBody.error;
          } catch (_) {
            // Keep the original error message.
          }
        }

        throw new Error(detail);
      }

      if (!data || !data.success) {
        throw new Error(
          data?.error || "The server did not confirm the submission."
        );
      }

      uploadMessage.textContent =
        "Document submitted. Reference number: " +
        data.reference_number;

      uploadForm.reset();
    } catch (error) {
      uploadMessage.textContent =
        "Submission failed: " + error.message;
    } finally {
      uploadButton.disabled = false;
    }
  });

  // Sign out.
  document
    .getElementById("applicant-logout")
    .addEventListener("click", async function () {
      const { error } = await client.auth.signOut();

      accountMessage.textContent = error
        ? "Sign-out failed: " + error.message
        : "You have signed out.";

      uploadMessage.textContent = "";
    });
});
