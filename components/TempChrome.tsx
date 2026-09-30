/*
 * Stopgap chrome for the -temp pages the live papagovans.com points at until
 * launch (2026-09-29). Hides the shared layout's nav, header buttons,
 * newsletter band, footer and every Start Your Build prompt; sends the logo to the live site; and keeps a
 * visitor inside the temp pages by rewriting gallery and build links to their
 * -temp copies. Delete with the -temp routes on launch day.
 */
/* .proj-cta and any link into the configurator go too: the configurator is
   not launched, so nothing here says "Start Your Build". */
const CSS = ".main-nav,.header-actions,.keep-in-touch,.site-footer,.proj-cta,a[href*=\"build.papagovans.com\"]{display:none!important}";

const JS = `(function(){
  var logo=document.querySelector('.site-header .logo');
  if(logo) logo.setAttribute('href','https://papagovans.com');
  document.querySelectorAll('a[href]').forEach(function(a){
    var h=a.getAttribute('href');
    if(h.indexOf('/projects/')===0) a.setAttribute('href','/projects-temp/'+h.slice(10));
    else if(h==='/van-life-build-gallery/') a.setAttribute('href','/van-life-build-gallery-temp/');
  });
})();`;

export function TempChrome() {
  return (
    <>
      <style>{CSS}</style>
      <script dangerouslySetInnerHTML={{ __html: JS }} />
    </>
  );
}
