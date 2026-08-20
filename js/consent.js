// Google Analytics loading + GDPR notice banner, kept separate from
// partials.js so the tracking ID / wording / config can change without
// touching header and navigation code. Included on every page via
// <script src="js/consent.js">.
(function () {

    var GA_MEASUREMENT_ID = 'G-WVYH3G8NGD';

    function loadGoogleAnalytics() {
        var gtagScript = document.createElement('script');
        gtagScript.async = true;
        gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
        document.head.appendChild(gtagScript);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { dataLayer.push(arguments); };
        gtag('js', new Date());
        // No ad features, no cross-site signals, IP truncated before storage.
        gtag('config', GA_MEASUREMENT_ID, {
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
        });
    }

    loadGoogleAnalytics();

    var CONSENT_NOTICE_DISMISSED_KEY = 'nms_analytics_notice_dismissed';

    var CONSENT_BANNER_HTML =
        '<div id="consent-banner" class="consent-banner" role="status">' +
            '<p class="consent-banner-text">' +
                'This site uses Google Analytics to see how it\'s used. No other data is collected, and nothing is shared with third parties.' +
            '</p>' +
            '<button type="button" id="consent-banner-dismiss" class="consent-banner-dismiss">Got it</button>' +
        '</div>';

    function initConsentBanner() {
        try {
            if (sessionStorage.getItem(CONSENT_NOTICE_DISMISSED_KEY)) {
                return;
            }
        } catch (e) {
            return;
        }

        document.body.insertAdjacentHTML('beforeend', CONSENT_BANNER_HTML);
        var banner = document.getElementById('consent-banner');
        document.getElementById('consent-banner-dismiss').addEventListener('click', function () {
            try {
                sessionStorage.setItem(CONSENT_NOTICE_DISMISSED_KEY, '1');
            } catch (e) { /* ignore */ }
            banner.remove();
        });
    }

    document.addEventListener('DOMContentLoaded', initConsentBanner);

})();
