"use strict";

document.documentElement.classList.add("js-enabled");

document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector("header nav > button");
  const mainMenu = document.querySelector("#main-menu");
  const quoteForm = document.querySelector("#quote-form");
  const packageSelect = document.querySelector("#package");
  const eventDateInput = document.querySelector("#event-date");
  const yearElement = document.querySelector("#current-year");

  /*
   * Automatically update the copyright year.
   */
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  /*
   * Prevent customers from selecting a past event date.
   */
  if (eventDateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    eventDateInput.min = `${year}-${month}-${day}`;
  }

  /*
   * Mobile navigation menu.
   */
  if (menuButton && mainMenu) {
    const closeMenu = () => {
      mainMenu.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation menu");
      menuButton.textContent = "Menu";
    };

    const openMenu = () => {
      mainMenu.classList.add("is-open");
      menuButton.setAttribute("aria-expanded", "true");
      menuButton.setAttribute("aria-label", "Close navigation menu");
      menuButton.textContent = "Close";
    };

    menuButton.addEventListener("click", () => {
      const isOpen =
        menuButton.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    /*
     * Close the menu after clicking a navigation link.
     */
    mainMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    /*
     * Close the menu when clicking outside it.
     */
    document.addEventListener("click", (event) => {
      const isOpen =
        menuButton.getAttribute("aria-expanded") === "true";

      if (
        isOpen &&
        !mainMenu.contains(event.target) &&
        !menuButton.contains(event.target)
      ) {
        closeMenu();
      }
    });

    /*
     * Close the menu when the Escape key is pressed.
     */
    document.addEventListener("keydown", (event) => {
      const isOpen =
        menuButton.getAttribute("aria-expanded") === "true";

      if (event.key === "Escape" && isOpen) {
        closeMenu();
        menuButton.focus();
      }
    });

    /*
     * Reset the menu when switching to desktop size.
     */
    window.addEventListener("resize", () => {
      if (window.innerWidth > 800) {
        closeMenu();
      }
    });
  }

  /*
   * Scroll reveal animations.
   */
  const revealSelectors = [
    "#experience > p",
    "#experience > h2",
    "#experience article",
    "#about > *",
    "section[aria-labelledby='speakeasy-title'] > *",
    "#packages > p",
    "#packages > h2",
    "#packages > aside",
    "#packages article",
    "#service-area > *",
    "#faq > p",
    "#faq > h2",
    "#faq details",
    "#quote > *"
  ];

  const revealElements = document.querySelectorAll(
    revealSelectors.join(",")
  );

  revealElements.forEach((element, index) => {
    element.classList.add("reveal");

    if (index % 3 === 1) {
      element.classList.add("reveal-delay-1");
    } else if (index % 3 === 2) {
      element.classList.add("reveal-delay-2");
    }
  });

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const showAllRevealElements = () => {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  };

  if (
    reduceMotion.matches ||
    !("IntersectionObserver" in window)
  ) {
    showAllRevealElements();
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  }

  /*
   * Automatically select a package when the customer
   * clicks "Request this package."
   */
  const packageValues = {
    "Bartender Only": "bartender-only",
    "Mix & Garnish": "mix-and-garnish",
    "The Full Pour": "full-pour",
    "Signature Experience": "signature",
    "Luxury Bar Experience": "luxury"
  };

  document
    .querySelectorAll("#packages article > a")
    .forEach((link) => {
      link.addEventListener("click", () => {
        const packageName = link
          .closest("article")
          ?.querySelector("h3")
          ?.textContent.trim();

        if (
          packageSelect &&
          packageName &&
          packageValues[packageName]
        ) {
          packageSelect.value = packageValues[packageName];
        }
      });
    });

  /*
   * Keep only one FAQ answer open at a time.
   */
  document.querySelectorAll("#faq details").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) {
        return;
      }

      document
        .querySelectorAll("#faq details[open]")
        .forEach((openItem) => {
          if (openItem !== item) {
            openItem.open = false;
          }
        });
    });
  });

  /*
   * Turn the quote form into a prefilled email.
   *
   * This works well for GitHub Pages because GitHub Pages
   * does not process forms by itself.
   */
  if (quoteForm) {
    quoteForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!quoteForm.checkValidity()) {
        quoteForm.reportValidity();
        return;
      }

      const formData = new FormData(quoteForm);
      const eventTypeSelect =
        document.querySelector("#event-type");

      const selectedPackage =
        packageSelect?.selectedOptions[0]?.textContent ||
        "Not sure yet";

      const selectedEventType =
        eventTypeSelect?.selectedOptions[0]?.textContent ||
        "Not provided";

      const subject =
        `Quote Request - ${formData.get("fullName")}`;

      const message = [
        "Hello Daniel and Daniela,",
        "",
        "I would like to request a mobile bartending quote.",
        "",
        `Name: ${formData.get("fullName")}`,
        `Email: ${formData.get("email")}`,
        `Phone: ${formData.get("phone")}`,
        `Event date: ${
          formData.get("eventDate") || "Not provided"
        }`,
        `Event city: ${formData.get("eventCity")}`,
        `Estimated guests: ${formData.get("guestCount")}`,
        `Event type: ${selectedEventType}`,
        `Package: ${selectedPackage}`,
        "",
        "Event details:",
        formData.get("eventDetails") ||
          "No additional details provided."
      ].join("\n");

      const mailtoLink =
        `mailto:hello@dannyspour.com` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(message)}`;

      window.location.href = mailtoLink;
    });
  }
});
