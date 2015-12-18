function getSmileys(e) {
    return e
}
window.linkify = function() {
    var e = "[a-z\\d.-]+://",
        t = "(?:(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])",
        a = "(?:(?:[^\\s!@#$%^&*()_=+[\\]{}\\\\|;:'\",.<>/?]+)\\.)+",
        n = "(?:ac|ad|aero|ae|af|ag|ai|al|am|an|ao|aq|arpa|ar|asia|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|cat|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|coop|com|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|in|io|iq|ir|is|it|je|jm|jobs|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mo|mp|mq|mr|ms|mt|museum|mu|mv|mw|mx|my|mz|name|na|nc|net|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|pro|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--80akhbyknj4f|xn--9t4b11yi5a|xn--deba0ad|xn--g6w251d|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--jxalpdlp|xn--kgbechtv|xn--zckzah|ye|yt|yu|za|zm|zw)",
        g = "(?:" + a + n + "|" + t + ")",
        s = "(?:[;/][^#?<>\\s]*)?",
        r = "(?:\\?[^#<>\\s]*)?(?:#[^<>\\s]*)?",
        c = "\\b" + e + "[^<>\\s]+",
        l = "\\b" + g + s + r + "(?!\\w)",
        i = "mailto:",
        m = "(?:" + i + ")?[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@" + g + r + "(?!\\w)",
        p = new RegExp("(?:" + c + "|" + l + "|" + m + ")", "ig"),
        u = new RegExp("^" + e, "i"),
        b = {
            "'": "`",
            ">": "<",
            ")": "(",
            "]": "[",
            "}": "{",
            "»": "«",
            "›": "‹"
        },
        o = {
            callback: function(e, t) {
                return t ? '<a href="' + t + '" title="' + t + '" target="_blank">' + e + "</a>" : e
            },
            punct_regexp: /(?:[!?.,:;'"]|(?:&|&amp;)(?:lt|gt|quot|apos|raquo|laquo|rsaquo|lsaquo);)$/
        };
    return function(e, t) {
        e = getSmileys(e), e = e.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/ /g, "&nbsp;").replace(/\n/g, "<br />"), t = t || {};
        var a, n, g, s, r, c, l, m, d, h, f, k, x = "",
            w = [];
        for (n in o) void 0 === t[n] && (t[n] = o[n]);
        for (; a = p.exec(e);)
            if (g = a[0], c = p.lastIndex, l = c - g.length, !/[\/:]/.test(e.charAt(l - 1))) {
                do m = g, k = g.substr(-1), f = b[k], f && (d = g.match(new RegExp("\\" + f + "(?!$)", "g")), h = g.match(new RegExp("\\" + k, "g")), (d ? d.length : 0) < (h ? h.length : 0) && (g = g.substr(0, g.length - 1), c--)), t.punct_regexp && (g = g.replace(t.punct_regexp, function(e) {
                    return c -= e.length, ""
                })); while (g.length && g !== m);
                s = g, u.test(s) || (s = (-1 !== s.indexOf("@") ? s.indexOf(i) ? i : "" : s.indexOf("irc.") ? s.indexOf("ftp.") ? "http://" : "ftp://" : "irc://") + s), r != l && (w.push([e.slice(r, l)]), r = c), w.push([g, s])
            }
        for (w.push([e.substr(r)]), n = 0; n < w.length; n++) x += t.callback.apply(window, w[n]);
        return x || e
    }
}();