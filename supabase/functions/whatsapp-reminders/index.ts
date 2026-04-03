import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Environment variables provided automatically by Supabase Edge Functions
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // Need service role to bypass RLS

const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN")!;
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")!;
const USE_TEMPLATE_MODE = Deno.env.get("USE_TEMPLATE_MODE") === "true";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function daysUntilDue(dateStr: string) {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);
    return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getCycleDay(nextDueDateStr: string) {
    const daysLeft = daysUntilDue(nextDueDateStr);
    if (daysLeft === null) return null;
    return 35 - daysLeft;
}

function formatPhoneNumber(phone: string) {
    if (!phone) return null;
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) cleaned = "91" + cleaned;
    if (cleaned.startsWith("0")) cleaned = "91" + cleaned.substring(1);
    return cleaned;
}

function formatDate(dateStr: string) {
    if (!dateStr || !dateStr.includes("-")) return dateStr;
    const parts = dateStr.split("-");
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY
}

async function sendWhatsAppMessage(toPhone: string, truck: any, cycleDay: number) {
    const url = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const formattedDate = formatDate(truck.nextDueDate);

    let body;
    if (USE_TEMPLATE_MODE) {
        body = {
            messaging_product: "whatsapp",
            to: toPhone,
            type: "template",
            template: {
                name: "wheel_track_reminder",
                language: { code: "en" },
                components: [
                    {
                        type: "body",
                        parameters: [
                            { type: "text", text: truck.truckNumber || "" },
                            { type: "text", text: truck.driver || "Driver" },
                            { type: "text", text: formattedDate },
                        ],
                    },
                ],
            },
        };
    } else {
        const textMessage = `🚛 Wheel Alignment Reminder\n\nTruck: ${truck.truckNumber}\nDriver: ${truck.driver}\n\nDue Date: ${formattedDate}\n\nPlease visit the workshop to avoid issues.`;
        body = {
            messaging_product: "whatsapp",
            to: toPhone,
            type: "text",
            text: { body: textMessage },
        };
    }

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const data = await response.json();
    return { success: response.ok, response: data };
}

serve(async (req) => {
    console.log("🔔 Starting WhatsApp Reminder Job...");

    const { data: trucks, error: trucksError } = await supabase.from("trucks").select("*");

    if (trucksError) {
        console.error("❌ Failed to fetch trucks:", trucksError);
        return new Response(JSON.stringify({ error: trucksError }), { status: 500 });
    }

    console.log(`📋 Found ${trucks.length} truck(s) in database.`);

    let sent = 0;

    for (const truck of trucks) {
        if (!truck.driverPhone) {
            console.log(`⏭️ Skipping truck ${truck.truckNumber}: No driver phone`);
            continue;
        }
        if (!truck.nextDueDate) {
            console.log(`⏭️ Skipping truck ${truck.truckNumber}: No due date`);
            continue;
        }

        const cycleDay = getCycleDay(truck.nextDueDate);
        console.log(`🔍 Truck ${truck.truckNumber} - Due Date: ${truck.nextDueDate} | Cycle Day Computed: ${cycleDay}`);

        if (![32, 34, 35, 36].includes(cycleDay!)) {
            console.log(`⏭️ Skipping truck ${truck.truckNumber}: Not a reminder day`);
            continue;
        }

        // Duplicate check
        const { data: existingLogs } = await supabase
            .from("reminder_logs")
            .select("id")
            .eq("truckId", truck.id)
            .eq("reminderDay", cycleDay)
            .eq("status", "sent")
            .limit(1);

        if (existingLogs && existingLogs.length > 0) {
            console.log(`⏭️ Skipping truck ${truck.truckNumber}: Day ${cycleDay} reminder already sent`);
            continue;
        }

        const formattedPhone = formatPhoneNumber(truck.driverPhone);
        if (!formattedPhone) {
            console.log(`❌ Invalid phone format for ${truck.truckNumber}`);
            continue;
        }

        console.log(`🚀 Sending Day ${cycleDay} Reminder to ${formattedPhone}...`);
        const result = await sendWhatsAppMessage(formattedPhone, truck, cycleDay);

        console.log(`📨 Send Result: ${result.success ? "SUCCESS" : "FAILED"}`);
        if (!result.success) console.error("WhatsApp API Error:", result.response);

        // Log the result
        await supabase.from("reminder_logs").insert({
            truckId: truck.id,
            truckNumber: truck.truckNumber,
            driverPhone: formattedPhone,
            reminderDay: cycleDay,
            nextDueDate: truck.nextDueDate,
            reminderDate: new Date().toISOString().split("T")[0],
            status: result.success ? "sent" : "failed",
            error: result.success ? null : result.response
        });

        if (result.success) sent++;
    }

    return new Response(JSON.stringify({ message: "Job complete", sent }), {
        headers: { "Content-Type": "application/json" },
    });
});
