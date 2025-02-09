const userOnboarding = {
  district: "",
  collegeId: "",
  collegeYear: "",
  collegeRoll: "",
  group: "",
  bio: "",
  favSub: "",
  nonFavSub: "",
  profilePic: ""
};


// ************ Slider Moving Codes ***********

// Select necessary elements
const slides = document.querySelectorAll(".slide");
const progressBar = document.querySelector(".progress-bar");
const backButton = document.querySelector(".fa-arrow-left");
const continueButtons = document.querySelectorAll(".move-section-btn");

let currentSlide = 0; // Tracks the current slide index
const totalSlides = slides.length; // Total number of slides

// Function to update the active slide and manage transitions
function updateSlides(newIndex, direction) {
  if (newIndex < 0 || newIndex >= totalSlides) {
    return; // Prevent navigating out of bounds
  }

  const outgoingSlide = slides[currentSlide];
  const incomingSlide = slides[newIndex];

  // Determine direction for transition
  const outgoingTransform = direction === "next" ? "-20%" : "120%";
  const incomingTransform = direction === "next" ? "120%" : "-20%";

  // Animate outgoing slide
  outgoingSlide.style.transform = `translateX(${outgoingTransform})`;
  outgoingSlide.style.opacity = "0";
  outgoingSlide.classList.remove("active");
  outgoingSlide.classList.add("exit");

  // Prepare incoming slide
  incomingSlide.style.transform = `translateX(${incomingTransform})`;
  incomingSlide.style.opacity = "0";
  incomingSlide.classList.remove("exit");
  incomingSlide.classList.add("active");

  // Delay opacity for smooth entry effect
  setTimeout(() => {
    incomingSlide.style.transform = "translateX(0)";
    incomingSlide.style.opacity = "1";
  }, 100);

  // Update the current slide index
  currentSlide = newIndex;

  // Update the progress bar width
  updateProgressBar();
}

// Function to update the progress bar dynamically
function updateProgressBar() {
  const progressPercentage = ((currentSlide + 1) / totalSlides) * 100;
  progressBar.style.width = `${progressPercentage}%`;
}

// Event listener for the back button (go to previous slide)
backButton.addEventListener("click", async () => {
  let isFirstSlide = document.querySelector('#slide-1').classList.contains('active')
  if (isFirstSlide) {
		let result = await Swal.fire({
        icon: 'warning',
        title: 'Are you sure you want to exit?',
        text: 'If you leave now, your account and progress will be deleted. You’ll need to start over if you return. Would you like to continue onboarding instead?',

        showConfirmButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: 'Exit Anyway',

        showCancelButton: true,
        cancelButtonColor: "#3085d6",
        cancelButtonText: 'Continue Onboarding',

        focusCancel: true,
    })

    if (result.isConfirmed) {
      let response = await fetch('/api/user/delete')
      let data = await response.json()
      if (data.ok) {
        window.location.href = '/'
      } else {
        Swal.fire({
          icon: 'error',
          title: 'An error occured!',
          text: "Couldn't delete your account! Please try again a bit later.",
          showConfirmButton: true,
          confirmButtonText: 'OK',
        })
      }
    }  
  }
  updateSlides(currentSlide - 1, "prev");
});

// Add event listeners to all "Continue" buttons for moving to the next slide
continueButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateSlides(currentSlide + 1, "next");
  });
});

// Initialize progress bar on page load
updateProgressBar();

/**
 * Initializes the district selection functionality.
 * Ensures only one option is selected at a time and updates the global userOnboarding object.
 * Manages the activation state of the first "move section" button for the district selection.
 */
function initializeDistrictSelection() {
  const options = document.querySelectorAll(".dist-option");

  // Initially disable all continue buttons
  continueButtons.forEach((button) =>
    button.classList.add("req-field-not-selected")
  );

  // Add event listeners to each district option for selection/deselection
  options.forEach((option) => {
    option.addEventListener("click", () => {
      // Remove the selected state from all options
      options.forEach((opt) => opt.classList.remove("dist-selected"));

      // Add the selected state to the clicked option
      option.classList.add("dist-selected");

      // Update the global userOnboarding object with the selected district
      const selectedDistrict = option.querySelector(".dist-label").innerText;
      userOnboarding.district = selectedDistrict;

      // Update the UI to show the correct checkmark visibility
      options.forEach((opt) => {
        const checkmark = opt.querySelector(".dist-opt-checkmark");
        checkmark.style.display = opt.classList.contains("dist-selected")
          ? "block"
          : "none";
      });

      // Enable only the first continue button
      continueButtons[0].classList.remove("req-field-not-selected");

      // Detailed logs for debugging
      //console.log("District Selected:", userOnboarding.district);
      //console.log("Updated userOnboarding Object:", userOnboarding);
    });
  });

  // Add event listeners to all move section buttons
  continueButtons.forEach((button, index) => {
    button.addEventListener("click", (event) => {
      // Prevent action if the button is inactive
      if (button.classList.contains("req-field-not-selected")) {
        event.preventDefault();
        //console.log(`Button ${index} is inactive. Cannot proceed.`);
      }

      // Log for when the button is active and clicked
      //console.log(`Button ${index} clicked. Proceeding to the next section.`);
      //console.log("Current userOnboarding Object:", userOnboarding);

      const tokiClgQtn = document.getElementById("tokiClgQtn");
      tokiClgQtn.textContent = `Which college in ${userOnboarding.district} do you attend?`;
    });
  });
}

// Initialize the functionality
initializeDistrictSelection();

/**
 * Disables all buttons with the 'req-field-not-selected' class.
 * Ensures no actions are triggered on these buttons.
 */
function initializeButtonDisabling() {
  const buttons = document.querySelectorAll(".move-section-btn");

  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      if (button.classList.contains("req-field-not-selected")) {
        event.preventDefault(); // Prevent default behavior
        event.stopPropagation(); // Stop further event propagation
        //console.log("Button is disabled. Action blocked.");
      }
    });
  });
}

// Initialize the disabling functionality
initializeButtonDisabling();

// Function to dynamically load colleges based on the selected district
function loadCollegesForDistrict() {
  const collegeContainer = document.querySelector(".clg-selection-grid");
  collegeContainer.innerHTML = ""; // Clear previous options

  const selectedDistrict = userOnboarding.district;

  // Generate and append college options
  const colleges = districtCollegeData[selectedDistrict];
  colleges.forEach((college) => {
    const collegeHTML = `
            <div class="clg-selection__card flex-col-center" data-college-id="${college.id}">
                <img 
                    class="clg-selection__card--logo"
                    src="images/onboarding-assets/College-logos/${college.logo}" 
                    alt="${college.name}">
                <p class="clg-label">${college.name}</p>
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="clg-select-icon" style="display: none;">
                    <g clip-path="url(#clip0_1844_2149)">
                        <circle cx="14" cy="14" r="14" fill="#1D8102"/> <!-- Green circle -->
                        <path d="M20.0564 8.62512L11.744 16.9376L7.94357 13.1371C7.49539 12.689 6.76887 12.689 6.32069 13.1371C5.8726 13.5853 5.8726 14.3118 6.32069 14.76L10.9326 19.3719C11.1567 19.5959 11.4503 19.708 11.744 19.708C12.0377 19.708 12.3314 19.5959 12.5555 19.3719L21.6793 10.2481C22.1274 9.79992 22.1274 9.07339 21.6793 8.62521C21.2311 8.17703 20.5045 8.17703 20.0564 8.62512Z" fill="white"/> <!-- Checkmark -->
                    </g>
                    <defs>
                        <clipPath id="clip0_1844_2149">
                            <rect width="28" height="28" fill="white"/>
                        </clipPath>
                    </defs>
                </svg>
            </div>
        `;
    collegeContainer.innerHTML += collegeHTML;
  });

  //console.log(`Loaded colleges for district: ${selectedDistrict}`);
}

// Function to handle college selection
function handleCollegeSelection() {
  const collegeCards = document.querySelectorAll(".clg-selection__card");
  const otherInputField = document.getElementById("other-college");
  const continueButton = document.querySelectorAll(".move-section-btn")[1];

  // Enable mutual exclusivity for college cards and the "Other" input
  collegeCards.forEach((card) => {
    card.addEventListener("click", () => {
      // Deselect "Other" input if a college is selected
      otherInputField.value = "";
      otherInputField.removeAttribute("disabled"); // Ensure the input is enabled for future use
      userOnboarding.collegeName = ""; // Clear any previously entered other college name

      // Deselect any previously selected college
      collegeCards.forEach((card) => {
        card.classList.remove("user-selected-clg");
        card.querySelector(".clg-select-icon").style.display = "none";
      });

      // Select the clicked college
      card.classList.add("user-selected-clg");
      card.querySelector(".clg-select-icon").style.display = "block";

      // Update userOnboarding with the selected college
      const collegeId = card.getAttribute("data-college-id");
      const collegeName = card.querySelector(".clg-label").textContent;
      userOnboarding.collegeId = collegeId;
      userOnboarding.collegeName = collegeName;

      //console.log(`Selected College: ${collegeName}, ID: ${collegeId}`);

      // Enable the second continue button
      continueButton.classList.remove("req-field-not-selected");
    });
  });

  // Handle "Other" input field focus and typing
  otherInputField.addEventListener("input", () => {
    const otherCollegeName = otherInputField.value.trim();

    if (otherCollegeName) {
      // Deselect all college cards if "Other" is being filled
      collegeCards.forEach((card) => {
        card.classList.remove("user-selected-clg");
        card.querySelector(".clg-select-icon").style.display = "none";
      });

      // Update userOnboarding with the "Other" college name
      userOnboarding.collegeId = null; // Clear any selected college ID
      userOnboarding.collegeName = otherCollegeName;

      //console.log(`Entered Other College: ${otherCollegeName}`);

      // Enable the second continue button
      continueButton.classList.remove("req-field-not-selected");
    } else {
      // If "Other" input is cleared, disable the continue button again
      userOnboarding.collegeName = "";
      continueButton.classList.add("req-field-not-selected");
    }
  });

  // Ensure the "Other" input field is always enabled and focusable
  otherInputField.addEventListener("focus", () => {
    otherInputField.removeAttribute("disabled"); // Ensure the input can be focused
  });
}

// Function to handle the second continue button click
function storeCollegeSelection() {
  const continueButton = document.querySelectorAll(".move-section-btn")[1];

  if (continueButton) {
    continueButton.addEventListener("click", () => {
      if (!userOnboarding.collegeName) {
        return;
      }

      //console.log("User onboarding data:", userOnboarding);
      // Proceed to the next step or functionality
    });
  }
}

// Example: Attach event listener to the first "Continue" button to load colleges
if (continueButtons[0]) {
  continueButtons[0].addEventListener("click", () => {
    if (!userOnboarding.district) {
      return;
    }

    // Load colleges for the selected district
    loadCollegesForDistrict();

    // Attach event listeners for college selection
    handleCollegeSelection();
  });
}

// Initialize the second "Continue" button functionality
storeCollegeSelection();

// Function to handle group, year, and roll number inputs for this slide
function handleGroupYearRollSelection() {
  const groupDropdown = document.querySelector("#img_category_options"); // Group dropdown options
  const yearDropdown = document.querySelectorAll("#img_category_options")[1]; // Year dropdown options
  const rollInputField = document.getElementById("college-roll"); // Roll number input field
  const continueButton = document.querySelectorAll(".move-section-btn")[2]; // Third slide's continue button

  let groupSelected = false;
  let yearSelected = false;
  let rollEntered = false;

  // Function to check if all fields are completed and enable the continue button
  function checkAllFieldsCompleted() {
    if (groupSelected && yearSelected && rollEntered) {
      continueButton.classList.remove("req-field-not-selected");
    } else {
      continueButton.classList.add("req-field-not-selected");
    }
  }

  // Handle group dropdown selection
  groupDropdown.addEventListener("click", (e) => {
    if (e.target.classList.contains("dropdown-option")) {
      const groupValue = e.target.getAttribute("data-value");
      userOnboarding.group = groupValue; // Push group value to the onboarding object
      document.querySelector("#img_category .selected").textContent =
        groupValue; // Update selected text
      groupSelected = true;
      //console.log(`Group Selected: ${groupValue}`);
      checkAllFieldsCompleted(); // Check if other fields are completed
    }
  });

  // Handle year dropdown selection
  yearDropdown.addEventListener("click", (e) => {
    if (e.target.classList.contains("dropdown-option")) {
      const yearValue = e.target.getAttribute("data-value");
      userOnboarding.collegeYear = yearValue; // Push year value to the onboarding object
      document.querySelectorAll("#img_category .selected")[1].textContent =
        yearValue; // Update selected text for year
      yearSelected = true;
      //console.log(`Year Selected: ${yearValue}`);
      checkAllFieldsCompleted(); // Check if other fields are completed
    }
  });

  // Handle roll number input
  rollInputField.addEventListener("input", () => {
    const rollValue = rollInputField.value.trim();
    if (rollValue && /^[0-9]{1,3}$/.test(rollValue)) {
      // Ensure roll is a max of 3 digits
      userOnboarding.collegeRoll = rollValue; // Push roll value to the onboarding object
      rollEntered = true;
      //console.log(`Roll Number Entered: ${rollValue}`);
    } else {
      userOnboarding.collegeRoll = ""; // Reset roll value if input is invalid
      rollEntered = false;
    }
    checkAllFieldsCompleted(); // Check if other fields are completed
  });

  // Initialize the continue button click logic
  continueButton.addEventListener("click", () => {
    if (!groupSelected || !yearSelected || !rollEntered) {
      return;
    }

    //console.log("User Onboarding Data:", userOnboarding);
    // Placeholder for next-step logic
  });
}

// Call the function to attach the event listeners for this slide
handleGroupYearRollSelection();

function adjustHeight(element) {
  element.style.height = "auto"; // Reset height to recalculate
  element.style.height = element.scrollHeight + "px"; // Adjust height to fit content
}

function updateCharCount(element) {
  const maxLength = element.maxLength;
  const currentLength = element.value.length;
  const charCount = document.getElementById("charCount");
  charCount.textContent = `${maxLength - currentLength}/200`;

  // show visually the red color if bio is bigger than 170 chars

  if (maxLength - currentLength <= 30) {
    charCount.style.color = "#FF3333";
  } else {
    charCount.style.color = "#000000";
  }
}

// Function to load subjects dynamically based on the user's group
function loadSubjects() {
  const subjectContainer = document.querySelector(".subj-selection-grid"); // Container for subject cards
  subjectContainer.innerHTML = ""; // Clear any previously loaded subjects

  const group = userOnboarding.group; // Get the user's group from onboarding data

  if (!group || !subjectsData[group]) {
    console.error("Invalid or missing group. Cannot load subjects.");
    subjectContainer.innerHTML = "<p>No subjects available for your group.</p>"; // Fallback message
    return;
  }

  // Combine general subjects and group-specific subjects
  const subjectsToLoad = [...subjectsData[group], ...subjectsData.general];

  // Generate and append subject cards
  subjectsToLoad.forEach((subject) => {
    const subjectHTML = `
            <div class="subj-selection__card flex-col-center">
                <img 
                    class="subj-selection__card--logo" 
                    src="/images/onboarding-assets/subjects/${subject.icon}" 
                    alt="${subject.name}">
                <p class="subj-label">${subject.name}</p>
            </div>
        `;
    subjectContainer.innerHTML += subjectHTML;
  });

  //console.log(`Loaded subjects for group: ${group}`);

  handleSubjectAndBioSelection();
}

// Attach the loading function to the third "Continue" button
if (continueButtons[2]) {
  continueButtons[2].addEventListener("click", () => {
    loadSubjects();
  });
}

function handleSubjectAndBioSelection() {
  const subjectCards = document.querySelectorAll(".subj-selection__card");
  const bioTextarea = document.getElementById("userBio"); // Textarea for bio input
  const continueButton = document.querySelectorAll(".move-section-btn")[3]; // Fourth slide's continue button

  let favSubjectSelected = false;
  let nonFavSubjectSelected = false;

  // Function to update the continue button state
  function updateContinueButton() {
    if (
      favSubjectSelected &&
      nonFavSubjectSelected &&
      bioTextarea.value.trim().length > 0
    ) {
      continueButton.classList.remove("req-field-not-selected");
    } else {
      continueButton.classList.add("req-field-not-selected");
    }
  }

  // Function to clear all subject selections
  function clearAllSelections() {
    subjectCards.forEach((card) => {
      card.classList.remove("selected-fav-subj");
      card.classList.remove("selected-non-fav-subj");
    });
    userOnboarding.favSub = "";
    userOnboarding.nonFavSub = "";
    favSubjectSelected = false;
    nonFavSubjectSelected = false;
    //console.log("All selections cleared. Start fresh.");
  }

  // Subject selection handling
  subjectCards.forEach((card) => {
    card.addEventListener("click", () => {
      const subjectName = card.querySelector(".subj-label").textContent;

      if (!favSubjectSelected) {
        // If no favorite is selected, mark this as favorite
        card.classList.add("selected-fav-subj");
        userOnboarding.favSub = subjectName;
        favSubjectSelected = true;
        //console.log(`Favorite Subject Selected: ${subjectName}`);
      } else if (
        !nonFavSubjectSelected &&
        !card.classList.contains("selected-fav-subj")
      ) {
        // If favorite is already selected, mark this as non-favorite
        card.classList.add("selected-non-fav-subj");
        userOnboarding.nonFavSub = subjectName;
        nonFavSubjectSelected = true;
        //console.log(`Non-Favorite Subject Selected: ${subjectName}`);
      } else {
        // If both favorite and non-favorite are selected, restart selection
        clearAllSelections();

        // Mark the clicked subject as favorite
        card.classList.add("selected-fav-subj");
        userOnboarding.favSub = subjectName;
        favSubjectSelected = true;
        //console.log(
        //   `Restarted Selection. New Favorite Subject: ${subjectName}`
        // );
      }

      // Update the continue button state
      updateContinueButton();
    });
  });

  // Bio input handling
  bioTextarea.addEventListener("input", (event) => {
    adjustHeight(event.target); // Adjust the height dynamically
    updateCharCount(event.target); // Update character count
    updateContinueButton(); // Check if all conditions are met for enabling the continue button
  });

  // Handle the continue button click
  continueButton.addEventListener("click", async () => {
    if (
      !favSubjectSelected ||
      !nonFavSubjectSelected ||
      bioTextarea.value.trim().length === 0
    ) {
      return;
    }

    // Store bio in the onboarding object
    userOnboarding.bio = bioTextarea.value.trim();

    let onboardData = new FormData()
    Object.entries(userOnboarding).forEach(entry => {
      onboardData.append(entry[0], entry[1])
    })

    document.querySelector('div#onboard-loader').style.display = 'flex'
    continueButton.style.display = 'none'

    let response = await fetch('/sign-up/onboard', {
      body: onboardData,
      method: 'post'
    })
    let data = await response.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Something went wrong!!',
        text: "Couldn't onboard you currectly!! Please try again a bit later",
        showConfirmButton: true,
        confirmButtonText: 'OK',
      }).then(result => {
        if (result.isConfirmed) {
          window.location.href = '/dashboard'
        }
      })
    }
    
    // Placeholder for next-step logic
  });

  // Initialize the continue button state
  updateContinueButton();
}

// These are some template codes, I am also not this horrible js writer :)

////////////////////////////////////
// prerequisite utility functions //
// the real stuff starts below    //
////////////////////////////////////
var util = {
    f: {
      addStyle: function (elem, prop, val, vendors) {
        var i, ii, property, value;
        if (!util.f.isElem(elem)) {
          elem = document.getElementById(elem);
        }
        if (!util.f.isArray(prop)) {
          prop = [prop];
          val = [val];
        }
        for (i = 0; i < prop.length; i += 1) {
          var thisProp = String(prop[i]),
            thisVal = String(val[i]);
          if (typeof vendors !== "undefined") {
            if (!util.f.isArray(vendors)) {
              vendors.toLowerCase() == "all"
                ? (vendors = ["webkit", "moz", "ms", "o"])
                : (vendors = [vendors]);
            }
            for (ii = 0; ii < vendors.length; ii += 1) {
              elem.style[vendors[i] + thisProp] = thisVal;
            }
          }
          thisProp = thisProp.charAt(0).toLowerCase() + thisProp.slice(1);
          elem.style[thisProp] = thisVal;
        }
      },
      cssLoaded: function (event) {
        var child = util.f.getTrg(event);
        child.setAttribute("media", "all");
      },
      events: {
        cancel: function (event) {
          util.f.events.prevent(event);
          util.f.events.stop(event);
        },
        prevent: function (event) {
          event = event || window.event;
          event.preventDefault();
        },
        stop: function (event) {
          event = event || window.event;
          event.stopPropagation();
        },
      },
      getSize: function (elem, prop) {
        return parseInt(elem.getBoundingClientRect()[prop], 10);
      },
      getTrg: function (event) {
        event = event || window.event;
        if (event.srcElement) {
          return event.srcElement;
        } else {
          return event.target;
        }
      },
      isElem: function (elem) {
        return util.f.isNode(elem) && elem.nodeType == 1;
      },
      isArray: function (v) {
        return v.constructor === Array;
      },
      isNode: function (elem) {
        return typeof Node === "object"
          ? elem instanceof Node
          : elem &&
              typeof elem === "object" &&
              typeof elem.nodeType === "number" &&
              typeof elem.nodeName === "string" &&
              elem.nodeType !== 3;
      },
      isObj: function (v) {
        return typeof v == "object";
      },
      replaceAt: function (str, index, char) {
        return str.substr(0, index) + char + str.substr(index + char.length);
      },
    },
  },
  //////////////////////////////////////
  // ok that's all the utilities      //
  // onto the select box / form stuff //
  //////////////////////////////////////
  form = {
    f: {
      init: {
        register: function () {
          var child,
            children = document.getElementsByClassName("dropdown-field"),
            i;
          for (i = 0; i < children.length; i += 1) {
            child = children[i];
            util.f.addStyle(child, "Opacity", 1);
          }
          children = document.getElementsByClassName("psuedo_select");
          for (i = 0; i < children.length; i += 1) {
            child = children[i];
            child.addEventListener("click", form.f.select.toggle);
          }
        },
        unregister: function () {
          //just here as a formallity
          //call this to stop all ongoing timeouts are ready the page for some sort of json re-route
        },
      },
      select: {
        blur: function (field) {
          field.classList.remove("focused");
          var child,
            children = field.childNodes,
            i,
            ii,
            nested_child,
            nested_children;
          for (i = 0; i < children.length; i += 1) {
            child = children[i];
            if (util.f.isElem(child)) {
              if (child.classList.contains("deselect")) {
                child.parentNode.removeChild(child);
              } else if (child.tagName == "SPAN") {
                if (!field.dataset.value) {
                  util.f.addStyle(child, ["FontSize", "Top"], ["16px", "32px"]);
                }
              } else if (child.classList.contains("psuedo_select")) {
                nested_children = child.childNodes;
                for (ii = 0; ii < nested_children.length; ii += 1) {
                  nested_child = nested_children[ii];
                  if (util.f.isElem(nested_child)) {
                    if (nested_child.tagName == "SPAN") {
                      if (!field.dataset.value) {
                        util.f.addStyle(
                          nested_child,
                          ["Opacity", "Transform"],
                          [0, "translateY(24px)"]
                        );
                      }
                    } else if (nested_child.tagName == "UL") {
                      util.f.addStyle(
                        nested_child,
                        ["Height", "Opacity"],
                        [0, 0]
                      );
                    }
                  }
                }
              }
            }
          }
        },
        focus: function (field) {
          field.classList.add("focused");
          var bool = false,
            child,
            children = field.childNodes,
            i,
            ii,
            iii,
            nested_child,
            nested_children,
            nested_nested_child,
            nested_nested_children,
            size = 0;
          for (i = 0; i < children.length; i += 1) {
            child = children[i];
            util.f.isElem(child) && child.classList.contains("deselect")
              ? (bool = true)
              : null;
          }
          if (!bool) {
            child = document.createElement("div");
            child.className = "deselect";
            child.addEventListener("click", form.f.select.toggle);
            field.insertBefore(child, children[0]);
          }
          for (i = 0; i < children.length; i += 1) {
            child = children[i];
            if (
              util.f.isElem(child) &&
              child.classList.contains("psuedo_select")
            ) {
              nested_children = child.childNodes;
              for (ii = 0; ii < nested_children.length; ii += 1) {
                nested_child = nested_children[ii];
                if (
                  util.f.isElem(nested_child) &&
                  nested_child.tagName == "UL"
                ) {
                  size = 0;
                  nested_nested_children = nested_child.childNodes;
                  for (iii = 0; iii < nested_nested_children.length; iii += 1) {
                    nested_nested_child = nested_nested_children[iii];
                    if (
                      util.f.isElem(nested_nested_child) &&
                      nested_nested_child.tagName == "LI"
                    ) {
                      size += util.f.getSize(nested_nested_child, "height");
                      //console.log("size: " + size);
                    }
                  }
                  util.f.addStyle(
                    nested_child,
                    ["Height", "Opacity"],
                    [size + "px", 1]
                  );
                }
              }
            }
          }
        },
        selection: function (child, parent) {
          var children = parent.childNodes,
            i,
            ii,
            nested_child,
            nested_children,
            time = 0,
            value;
          if (util.f.isElem(child) && util.f.isElem(parent)) {
            parent.dataset.value = child.dataset.value;
            value = child.innerHTML;
          }
          for (i = 0; i < children.length; i += 1) {
            child = children[i];
            if (util.f.isElem(child)) {
              if (child.classList.contains("psuedo_select")) {
                nested_children = child.childNodes;
                for (ii = 0; ii < nested_children.length; ii += 1) {
                  nested_child = nested_children[ii];
                  if (
                    util.f.isElem(nested_child) &&
                    nested_child.classList.contains("selected")
                  ) {
                    if (nested_child.innerHTML) {
                      time = 1e2;
                      util.f.addStyle(
                        nested_child,
                        ["Opacity", "Transform"],
                        [0, "translateY(24px)"],
                        "all"
                      );
                    }
                    setTimeout(
                      function (c, v) {
                        c.innerHTML = v;
                        util.f.addStyle(
                          c,
                          ["Opacity", "Transform", "TransitionDuration"],
                          [1, "translateY(0px)", ".1s"],
                          "all"
                        );
                      },
                      time,
                      nested_child,
                      value
                    );
                  }
                }
              } else if (child.tagName == "SPAN") {
                util.f.addStyle(child, ["FontSize", "Top"], ["12px", "8px"]);
              }
            }
          }
        },
        toggle: function (event) {
          util.f.events.stop(event);
          var child = util.f.getTrg(event),
            children,
            i,
            parent;
          switch (true) {
            case child.classList.contains("psuedo_select"):
            case child.classList.contains("deselect"):
              parent = child.parentNode;
              break;
            case child.classList.contains("dropdown-options"):
              parent = child.parentNode.parentNode;
              break;
            case child.classList.contains("dropdown-option"):
              parent = child.parentNode.parentNode.parentNode;
              form.f.select.selection(child, parent);
              break;
          }
          parent.classList.contains("focused")
            ? form.f.select.blur(parent)
            : form.f.select.focus(parent);
        },
      },
    },
  };
window.onload = form.f.init.register;

document.querySelector('#profile-pic-selector').addEventListener('click', function() {
    let imageSelctor = document.querySelector('#profile-picture')
    imageSelctor.click()
})
document.querySelector('#profile-picture').addEventListener('change', function(event) {
    let profilePic = event.target.files[0]
    userOnboarding.profilePic = profilePic
    let selectedProfilePic = document.querySelector('#selected-profile-pic')
    if(profilePic) {
        document.querySelector('#profile-picture-preview').style.display = 'flex'
        document.querySelector('.upload-prfl-pic-box').style.display = 'none'
        let blobUrl = URL.createObjectURL(profilePic)
        selectedProfilePic.src = blobUrl
        selectedProfilePic.onload = function() {
            URL.revokeObjectURL(selectedProfilePic.src);
        }
    }
});
