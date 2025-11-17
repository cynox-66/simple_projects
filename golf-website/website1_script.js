/* ---------------- CUSTOM CURSOR MOVEMENT ---------------- */

/*
We move the cursor using left and top (NO transition here),
movement must stay instant so it follows the real mouse.
*/
var crsr = document.querySelector("#cursor");
var crsrblur = document.querySelector("#cursor-blur");

document.addEventListener("mousemove", function (e) {
  crsr.style.left = e.x + "px";
  crsr.style.top = e.y + "px";

  // blur circle trails slightly behind
  crsrblur.style.left = (e.x - 200) + "px";
  crsrblur.style.top = (e.y - 200) + "px";
});


/* ---------------- CURSOR HOVER EFFECT ON NAVBAR ---------------- */

var navItems = document.querySelectorAll("#nav h4");

/*
When hovering on navbar links:
- Cursor grows
- Cursor becomes outlined
- Cursor background becomes transparent
*/
navItems.forEach(function (item) {
  item.addEventListener("mouseenter", function () {
    crsr.style.transform = "translate(-50%, -50%) scale(2.5)";
    crsr.style.border = "1px solid #fff";
    crsr.style.backgroundColor = "transparent";
  });

  item.addEventListener("mouseleave", function () {
    crsr.style.transform = "translate(-50%, -50%) scale(1)";
    crsr.style.border = "none";
    crsr.style.backgroundColor = "#95C11E";
  });
});


/* ---------------- CURSOR HOVER EFFECT ON CARDS ---------------- */

var cards = document.querySelectorAll(".card");

/*
Same hover effect for cards so the cursor matches theme.
This was broken earlier because we accidentally looped navItems again.
*/
cards.forEach(function (card) {
  card.addEventListener("mouseenter", function () {
    crsr.style.transform = "translate(-50%, -50%) scale(2.5)";
    crsr.style.border = "1px solid #fff";
    crsr.style.backgroundColor = "transparent";
  });

  card.addEventListener("mouseleave", function () {
    crsr.style.transform = "translate(-50%, -50%) scale(1)";
    crsr.style.border = "none";
    crsr.style.backgroundColor = "#95C11E";
  });
});


/* ---------------- NAV SCROLL ANIMATION (GSAP) ---------------- */

gsap.to("#nav", {
  backgroundColor: "#000",
  height: "110px",
  duration: 0.5,
  scrollTrigger: {
    trigger: "#main",
    start: "top top",
    end: "top -20%",
    scrub: 1.8
  },
});

gsap.to("#main", {
  backgroundColor: "#000",
  scrollTrigger: {
    trigger: "#main",
    start: "top -25%",
    end: "top -80%",
    scrub: 2
  },
});


/* ---------------- PAGE 3 TEXT SLIDER ---------------- */

let reviews = document.querySelectorAll("#slider p");
let leftQuote = document.querySelector(".quote-left");
let rightQuote = document.querySelector(".quote-right");
let reviewIndex = 0;

/*
Small animation on the quote icons whenever the text changes.
*/
function animateQuotes() {
  leftQuote.classList.add("animate-quote");
  rightQuote.classList.add("animate-quote");

  setTimeout(() => {
    leftQuote.classList.remove("animate-quote");
    rightQuote.classList.remove("animate-quote");
  }, 600);
}

/*
This function shows only ONE review at a time.
*/
function showReview() {
  reviews.forEach((p, i) => {
    p.classList.toggle("active", i === reviewIndex);
  });

  animateQuotes();
  reviewIndex = (reviewIndex + 1) % reviews.length;
}

showReview();              // Show the first review immediately
setInterval(showReview, 5000); // Change review every 5 seconds
