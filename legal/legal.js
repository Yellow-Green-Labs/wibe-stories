// Wibe Stories — Legal section behavior
// Builds the "On this page" TOC from headings and highlights the active section.

document.addEventListener("DOMContentLoaded", () => {
  const content = document.querySelector(".doc-content");
  const tocList = document.querySelector(".doc-toc ol");
  if (!content || !tocList) return;

  const headings = Array.from(content.querySelectorAll("h2[id], h3[id]"));
  if (!headings.length) return;

  const links = [];

  headings.forEach((heading) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#" + heading.id;
    a.textContent = heading.textContent;
    if (heading.tagName === "H3") a.classList.add("sub");
    li.appendChild(a);
    tocList.appendChild(li);
    links.push(a);
  });

  if (!("IntersectionObserver" in window)) return;

  const setActive = (id) => {
    links.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + id);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
  );

  headings.forEach((h) => observer.observe(h));
});
