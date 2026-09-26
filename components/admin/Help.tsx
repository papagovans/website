/* Explanations for sections that have nothing to type in. */
const box = { padding: "12px 14px", borderRadius: 6, background: "var(--theme-elevation-50)", fontSize: 13, lineHeight: 1.5 };

export const TeamHelp = () => (
  <p style={box}>Shows everyone under <b>Content → Team</b>, grouped by department. Add, remove or reorder people there.</p>
);
export const VanHelp = () => (
  <p style={box}>Shows the rotating 3D model of a Papago van with its labelled features. The model itself is changed in code.</p>
);
export const GalleryHelp = () => (
  <p style={box}>Shows every finished build as a grid of photos, newest projects included automatically.</p>
);
