(() => {
  "use strict";

  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      navLinks.classList.toggle("is-open", !isOpen);
    });

    navLinks.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        navLinks.classList.remove("is-open");
      }
    });
  }

  if (document.body.dataset.page === "identify") {
    const plasticTypes = {
      "1": {
        short: "PET",
        fullName: "Polyethylene terephthalate",
        uses: "Commonly found in drink bottles and food containers.",
        advice: "Empty and rinse it. Check whether your local recycling programme accepts this item; a resin code does not guarantee local collection.",
      },
      "2": {
        short: "HDPE",
        fullName: "High-density polyethylene",
        uses: "Commonly found in milk, detergent and shampoo containers.",
        advice: "Empty and rinse containers, then check whether your local recycling programme accepts them.",
      },
      "4": {
        short: "LDPE",
        fullName: "Low-density polyethylene",
        uses: "Commonly found in plastic bags, wraps and flexible films.",
        advice: "Do not put plastic bags or film in your household recycling bin. Look for a participating store drop-off and confirm it accepts the material.",
      },
      "5": {
        short: "PP",
        fullName: "Polypropylene",
        uses: "Commonly found in tubs, caps and some food containers.",
        advice: "Empty and rinse the item, then check your local programme. Acceptance varies by area and by item.",
      },
      "6": {
        short: "PS",
        fullName: "Polystyrene",
        uses: "Commonly found in foam packaging, cups and some food trays.",
        advice: "Few local programmes accept polystyrene foam. Check for a suitable drop-off before bringing it; otherwise follow local disposal guidance.",
      },
    };

    const uploadInput = document.querySelector("#photo-upload");
    const cameraInput = document.querySelector("#camera-upload");
    const dropZone = document.querySelector("#drop-zone");
    const preview = document.querySelector("#image-preview");
    const dropContent = document.querySelector("#drop-content");
    const fileDetails = document.querySelector("#file-details");
    const fileName = document.querySelector("#file-name");
    const photoError = document.querySelector("#photo-error");
    let previewUrl = null;
    let selectedCode = "";

    const hidePhotoError = () => {
      photoError.hidden = true;
      photoError.textContent = "";
    };

    const showPhotoError = (message) => {
      photoError.textContent = message;
      photoError.hidden = false;
    };

    const clearPhoto = () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = null;
      }
      uploadInput.value = "";
      cameraInput.value = "";
      preview.removeAttribute("src");
      preview.hidden = true;
      dropContent.hidden = false;
      fileDetails.hidden = true;
      fileName.textContent = "";
      hidePhotoError();
    };

    const handleFile = (file) => {
      hidePhotoError();
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        showPhotoError("Please choose an image file.");
        return;
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = URL.createObjectURL(file);
      preview.src = previewUrl;
      preview.hidden = false;
      dropContent.hidden = true;
      fileName.textContent = file.name;
      fileDetails.hidden = false;
    };

    document.querySelector("#choose-photo").addEventListener("click", () => uploadInput.click());
    document.querySelector("#take-photo").addEventListener("click", () => cameraInput.click());
    uploadInput.addEventListener("change", () => handleFile(uploadInput.files[0]));
    cameraInput.addEventListener("change", () => handleFile(cameraInput.files[0]));
    document.querySelector("#clear-photo").addEventListener("click", clearPhoto);

    dropZone.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      uploadInput.click();
    });
    dropZone.addEventListener("keydown", (event) => {
      if (event.target !== dropZone || (event.key !== "Enter" && event.key !== " ")) return;
      event.preventDefault();
      uploadInput.click();
    });
    ["dragenter", "dragover"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropZone.classList.add("drag-over");
      });
    });
    ["dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropZone.classList.remove("drag-over");
      });
    });
    dropZone.addEventListener("drop", (event) => {
      handleFile(event.dataTransfer.files[0]);
    });

    document.querySelectorAll(".resin-option").forEach((option) => {
      option.addEventListener("click", () => {
        selectedCode = option.dataset.code;
        document.querySelectorAll(".resin-option").forEach((button) => {
          button.setAttribute("aria-pressed", String(button === option));
        });
        document.querySelector("#identify-error").hidden = true;
      });
    });

    document.querySelector("#identify-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const error = document.querySelector("#identify-error");
      if (!plasticTypes[selectedCode]) {
        error.hidden = false;
        return;
      }
      error.hidden = true;
      const plastic = plasticTypes[selectedCode];
      document.querySelector("#result-title").textContent = `${plastic.short} plastic information`;
      document.querySelector("#result-code").textContent = selectedCode;
      document.querySelector("#result-full-name").textContent = plastic.fullName;
      document.querySelector("#result-abbreviation").textContent = plastic.short;
      document.querySelector("#result-uses").textContent = plastic.uses;
      document.querySelector("#result-advice").textContent = plastic.advice;
      document.querySelector("#identification-result").hidden = false;
      document.querySelector("#identification-result").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    document.querySelector("#choose-another").addEventListener("click", () => {
      document.querySelector("#identification-result").hidden = true;
      document.querySelector("#identify-form").scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  if (document.body.dataset.page === "locations") {
    const form = document.querySelector("#location-search");
    const input = document.querySelector("#location-query");
    const map = document.querySelector("#location-map");
    const placeholder = document.querySelector("#map-placeholder");
    const mapTitle = document.querySelector("#map-title");
    const openMap = document.querySelector("#open-map");
    const error = document.querySelector("#location-error");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const area = input.value.trim();
      if (!area) {
        error.hidden = false;
        input.focus();
        return;
      }
      error.hidden = true;
      const query = `plastic recycling centres near ${area}`;
      const encodedQuery = encodeURIComponent(query);
      map.src = `https://maps.google.com/maps?q=${encodedQuery}&output=embed`;
      map.hidden = false;
      placeholder.hidden = true;
      mapTitle.textContent = `Map search: ${area}`;
      openMap.href = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
      openMap.setAttribute("aria-label", `Open plastic recycling centre search for ${area} in Google Maps`);
    });

    input.addEventListener("input", () => {
      if (input.value.trim()) error.hidden = true;
    });
  }
})();