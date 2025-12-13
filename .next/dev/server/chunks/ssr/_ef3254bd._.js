module.exports = [
"[project]/app/actions/submit-quote.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"400714db36d17b229241d310238feaddfc72e4afe0":"submitQuote"},"",""] */ __turbopack_context__.s([
    "submitQuote",
    ()=>submitQuote
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
async function submitQuote(data) {
    // Server-side validation
    const errors = {};
    if (!data.firstName || data.firstName.trim().length === 0) {
        errors.firstName = "First name is required";
    }
    if (!data.lastName || data.lastName.trim().length === 0) {
        errors.lastName = "Last name is required";
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = "Valid email is required";
    }
    if (!data.phone || data.phone.trim().length === 0) {
        errors.phone = "Phone number is required";
    }
    if (!data.location || data.location.trim().length === 0) {
        errors.location = "Location is required";
    }
    if (data.location === "other" && (!data.customLocation || data.customLocation.trim().length === 0)) {
        errors.customLocation = "Please specify your location";
    }
    if (!data.service) {
        errors.service = "Please select a service";
    }
    if (data.bedrooms < 0) {
        errors.bedrooms = "Invalid number of bedrooms";
    }
    if (data.bathrooms < 1) {
        errors.bathrooms = "At least one bathroom is required";
    }
    if (Object.keys(errors).length > 0) {
        return {
            success: false,
            message: "Please fix the errors in the form",
            errors
        };
    }
    try {
        // TODO: Integrate with email service (SendGrid, Resend, etc.)
        // TODO: Store in database if needed
        // For now, log the submission (in production, this would send an email)
        console.log("Quote Request Received:", {
            ...data,
            submittedAt: new Date().toISOString()
        });
        // Simulate email sending
        // In production, replace this with actual email service:
        // await sendEmail({
        //   to: 'support@shalean.com',
        //   subject: `New Quote Request from ${data.firstName} ${data.lastName}`,
        //   body: formatQuoteEmail(data),
        // });
        return {
            success: true,
            message: "Quote request submitted successfully! We'll get back to you soon."
        };
    } catch (error) {
        console.error("Error submitting quote:", error);
        return {
            success: false,
            message: "An error occurred while submitting your quote. Please try again."
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    submitQuote
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(submitQuote, "400714db36d17b229241d310238feaddfc72e4afe0", null);
}),
"[project]/.next-internal/server/app/booking/quote/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/actions/submit-quote.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$submit$2d$quote$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/submit-quote.ts [app-rsc] (ecmascript)");
;
}),
"[project]/.next-internal/server/app/booking/quote/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/actions/submit-quote.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "400714db36d17b229241d310238feaddfc72e4afe0",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$submit$2d$quote$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["submitQuote"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$booking$2f$quote$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$actions$2f$submit$2d$quote$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/booking/quote/page/actions.js { ACTIONS_MODULE0 => "[project]/app/actions/submit-quote.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$submit$2d$quote$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/submit-quote.ts [app-rsc] (ecmascript)");
}),
"[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/* eslint-disable import/no-extraneous-dependencies */ Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "registerServerReference", {
    enumerable: true,
    get: function() {
        return _server.registerServerReference;
    }
});
const _server = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)"); //# sourceMappingURL=server-reference.js.map
}),
"[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// This function ensures that all the exported values are valid server actions,
// during the runtime. By definition all actions are required to be async
// functions, but here we can only check that they are functions.
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ensureServerEntryExports", {
    enumerable: true,
    get: function() {
        return ensureServerEntryExports;
    }
});
function ensureServerEntryExports(actions) {
    for(let i = 0; i < actions.length; i++){
        const action = actions[i];
        if (typeof action !== 'function') {
            throw Object.defineProperty(new Error(`A "use server" file can only export async functions, found ${typeof action}.\nRead more: https://nextjs.org/docs/messages/invalid-use-server-value`), "__NEXT_ERROR_CODE", {
                value: "E352",
                enumerable: false,
                configurable: true
            });
        }
    }
} //# sourceMappingURL=action-validate.js.map
}),
];

//# sourceMappingURL=_ef3254bd._.js.map