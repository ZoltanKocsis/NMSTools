// Shared site header + navigation, injected into every page so the markup
// only has to live in one place. Runs as a plain <script src> (no fetch())
// so pages keep working when opened directly from disk.
//
// Analytics/consent banner logic lives in js/consent.js.
(function () {

    var SITE_HEADER_HTML =
        '<header class="site-header">' +
            '<div class="site-header-inner">' +
                '<img src="images/favicon-96x96.png" alt="Site logo" class="site-logo">' +
                '<div class="site-header-text">' +
                    '<div class="site-title">No Man\'s Sky Usefull Tools Fun Page</div>' +
                    '<div class="site-subtitle">Developed some useful offline  web-apps that make life easier using NMS. Some of them exist at other places, but I tried to make them more user friendly</div>' +
                '</div>' +
            '</div>' +
        '</header>';

    var NAV_LINKS = [
        { href: 'index.html', label: 'Home' },
        { href: 'xeno_arena_counter_picker.html', label: 'Xeno Arena Best Pest Picker' },
        { href: 'xeno-arena-traits-picker.html', label: 'Xeno Moves Calculator' },
        { href: 'pets_trait_triangle.html', label: 'Pets Trait Triangle' },
        { href: 'nms_glyph_decoder.html', label: 'Symbol Reading' },
        { href: 'about.html', label: 'About' }
    ];

    function buildNavHtml() {
        var currentPage = location.pathname.split('/').pop() || 'index.html';

        var links = NAV_LINKS.map(function (link) {
            var isActive = link.href === currentPage;
            return '<a href="' + link.href + '" class="nav-tab' + (isActive ? ' active' : '') + '">' +
                link.label +
                '</a>';
        }).join('');

        return '<nav class="main-navigation" aria-label="Main navigation">' + links + '</nav>';
    }

    document.addEventListener('DOMContentLoaded', function () {
        var placeholder = document.getElementById('site-chrome');
        if (placeholder) {
            placeholder.outerHTML = SITE_HEADER_HTML + buildNavHtml();
        }
    });

})();
