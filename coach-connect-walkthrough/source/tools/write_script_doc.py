"""Write narration-script.md from the narration timings.

    python3 source/tools/write_script_doc.py

Run after narrate.py so the timestamps match the current voice.
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
N = json.loads((ROOT / "source" / "assets" / "audio" / "narration.json").read_text())

ON_SCREEN = {
    "welcome": "Title card: KSBDC logo, *Coach Connect*, and a *Four steps* card that lights up step by step.",
    "walk": "A browser rises in, the address bar types *register.kentuckysbdc.com*, and the form loads. The navy *Behind the scenes* rail slides in.",
    "steps": "The camera moves into the form's sidebar and circles each step as it is named.",
    "maya": "A *Fictional sample client* card appears in the rail. The pointer fills in Maya's name, email, phone, and address.",
    "home": "The hint *Use your home address if you're not in business yet* is circled.",
    "banner": "The camera pans to the training-calendar banner, circled as *No-cost training calendar*.",
    "zip": "ZIP 40202 is typed and *Your coaching center: Louisville SBDC* pops in. Rail item 1: *Center matched*.",
    "fallback": "A *What if* card: ZIP 45202 (Cincinnati) gets *Our Eastern Kentucky intake team will help connect you with the right coach.*",
    "saved": "Continue is clicked and reads *Saving your registration…*. Rail item 2: *Contact details saved*. Step 2 loads.",
    "journey": "The pointer hovers *Starting a business*, then picks *Already in business*.",
    "inbiz": "Business name, date established, employee counts, and products fill in. The employee fields are circled: *At least one employee, full- or part-time*.",
    "help": "*How can we help?* is typed in Maya's words.",
    "demo": "The six demographic questions are answered. Callouts: *Prefer not to say is an option*, *Male or Female*, *Doesn't affect the coaching match*. Continue.",
    "review": "The review screen. The answers are outlined, then *Edit your details* (*Jumps back to step 1*).",
    "boxes": "Both required boxes are checked, each marked *Required*.",
    "sign": "The signature is typed (*Must match the name entered*). The SBA mailing permission is marked *Optional* and left unchecked.",
    "register": "*Register & choose appointment* is clicked and reads *Saving your registration…*. Rail item 3: *Registration recorded*. Step 4 loads.",
    "pick": "Louisville's three coach cards. The grid, then each *I can help with* list, are outlined.",
    "claire": "The camera moves to Claire Bridges. *Restaurant & catering operations* is highlighted (*Matches Maya's business*). *Meet with Claire* reads *Saving selection…*.",
    "calendly": "Rail item 4: *Coach selected*. A simplified Calendly scheduler loads in the page; the prefilled name and email are circled.",
    "booked": "A date, then 10:30am, then *Schedule event*. *You're on the calendar.* The confirmation and record-note lines are circled. Rail item 5: *Booking noted*.",
    "variants": "Two cards over a dimmed screen: Lexington SBDC (photo cards plus first available) and South Central SBDC (a simple list).",
    "retry": "A card showing the failed-note state, with *Retry the note update* circled.",
    "handoffs": "Full screen: *Five handoffs, one visit*.",
    "pipeline": "Five steps light up as they are named: ZIP code (in the form), Continue (Coach Connect), Register (Neoserra), Coach choice (Calendly), Booking (Neoserra).",
    "walkin": "Staff tip card. The pointer clicks *Start a new registration* and the form resets to step 1.",
    "phone": "Help-line card. *1-888-414-7232* brightens as it is read, then *Monday–Friday, 8am–5pm*.",
    "close": "End card: *Coach Connect*, then *Register. Match. Book. All in one visit.*",
    "url": "The address types into a pill: *register.kentuckysbdc.com*. Partner logos and the footer line fade in.",
}

NOTES = """## Presenter notes

Everything below comes from the live form's own code and copy at register.kentuckysbdc.com, captured November 19, 2026. Use these when you have more time or get questions.

1. **Welcome.** A client registers and books a first appointment with a coach in the same visit, at register.kentuckysbdc.com.
2. **Four steps.** The steps are listed in the sidebar. On a phone, the four steps run across the top and the sidebar's help text is hidden.
3. **Step 1, your details.**
   - Required: first and last name, email, phone, street address, city, state (defaults to Kentucky), and ZIP.
   - The form checks for a valid email, a 10-digit US phone number, and a five-digit ZIP or ZIP+4.
   - **ZIP routing:** 965 ZIP codes map to 12 centers. Any ZIP not on the map, including out-of-state ZIPs, goes to Eastern Kentucky SBDC's intake (Andrea Taylor).
   - The training banner appears on step 1 only and links to the public training calendar (kysbdc.ecenterdirect.com/events).
   - **Continue saves the contact details right away.** If that save fails, the client sees "We could not save your contact details. Your answers are still here. Please try Continue again."
4. **Step 2, your business.**
   - The form defines "in business": the client has taken on debt or equity, had business expenses, sold to customers other than friends or family, or paid employees or contractors.
   - *Already in business* adds business name, date established (not in the future), full-time and part-time employees, and products or services.
   - **Common snag:** an operating business must report at least one full-time or part-time employee in total. A solo owner who enters 0 and 0 gets "An operating business needs at least one full-time or part-time employee."
   - *How can we help?* is required (up to 4,000 characters).
   - The demographic questions are required. Every one offers *Prefer not to say* except Sex, which is Male or Female. The form states the answers do not affect the coaching match.
5. **Step 3, review and consent.**
   - *Edit your details* returns to step 1 with everything still filled in.
   - Two required boxes: the client agreement, and the certification (not suspended or debarred, legally authorized to receive taxpayer-funded assistance, information accurate). A client who can't certify is told to call 1-888-414-7232.
   - The signature must match the first and last name entered. Capitalization and extra spaces don't matter.
   - The SBA survey and mailing permission is optional and not required for services.
   - *Register & choose appointment* records the registration. The form's code refers to this as its Neoserra connection.
6. **Step 4, your appointment.**
   - **Louisville** shows photo cards with specialties: Dave Oetken, Rhonda Jones, Claire Bridges.
   - **Lexington** shows photo cards for Fausto Sarmiento, Stuart Arnold, and Tonya Parsons, plus *Prefer the first available coach?*, which books with Andrea Taylor at Eastern Kentucky SBDC.
   - **Southeastern Kentucky** lists Rodney Kuhl and Kyle Mann, each with the counties they serve.
   - **Every other center** shows its coach in a simple list: Berea (Katie Startzman), Covington (April Coffee), Eastern Kentucky (Andrea Taylor), Elizabethtown (Patricia Krausman), Frankfort (Toni Sears), Maysville (Mike Jackson), Owensboro (Meagan Cooley), Paducah (Aaron Harned), South Central (Brittanie Dawson).
   - Choosing a coach saves the choice, then opens that coach's Calendly inside the page with the client's name and email filled in. *Change coach* appears when a center has more than one option. If the calendar is slow, the client gets *Try again* and an *Open Calendly in a new tab* link.
   - After booking, Calendly emails the confirmation; rescheduling and canceling happen through the links in that email. The booking is then noted on the client's Kentucky SBDC record. If that note fails, the booking still stands and the client sees *Retry the note update*.
   - If a client reopens the form in the same browser soon after registering, it picks up at the appointment step. (The session cookie lasts 24 hours.)
7. **Behind the scenes.** The ZIP lookup happens instantly in the client's browser. Continue saves the contact details. Register records the registration in Neoserra. The coach choice opens the coach's Calendly. The booking is noted back on the record.
8. **Staff tips.** After a booking, *Registering another client? Start a new registration* clears the form, which helps when staff enter walk-ins. The help line (1-888-414-7232, Monday–Friday, 8am–5pm) is in the sidebar on computer screens.
9. **Wrap-up.** A good place to pause and switch to *Try it yourself* for hands-on practice.

## To confirm before training

The front end can't show these, so the video stays silent on them. Worth confirming with whoever administers Coach Connect:

- Where the contact details saved on Continue go, and who follows up when a client stops partway.
- How the Calendly booking note appears in Neoserra, and what notice coaches get beyond Calendly's own email.
- Whether the coach roster or ZIP routing is due to change. The demo copies the live data as of November 19, 2026.

## Source and accuracy

- Screens are a faithful replica of the live form (layout, copy, validation messages, coach cards), rebuilt for the demo. The scheduler is a simplified stand-in for the coach's Calendly page.
- Maya Brooks and Brooks Street Kitchen are fictional. Coach names and photos are the real ones shown on the live form.
- No real registration or appointment was created while making this. The live form was captured with every server call answered locally.
"""


def ts(t):
    return f"{int(t // 60)}:{int(t % 60):02d}"


def main():
    chapters = N["chapters"]
    rows = []
    last_ch = -1
    for c in N["cues"]:
        ch = c["ch"]
        label = f"{ch + 1} · {chapters[ch]['title']}" if ch != last_ch else ""
        last_ch = ch
        cap = c["cap"].replace("|", "\\|")
        rows.append(f"| {ts(c['t'])} | {label} | {ON_SCREEN[c['id']]} | {cap} |")
    total = N["duration"]
    doc = f"""# Coach Connect: A Staff Walkthrough

**Narration script and presenter notes** · Run time {ts(total)} · 16:9, 1920×1080 · Voice: {N['voice']['name']} (ElevenLabs, {N['model']})
Audience: Kentucky SBDC staff and business coaches · Sample client: Maya Brooks, Brooks Street Kitchen, Louisville (fictional)

## How to use this script

- **As a video:** the narration is built in. Captions are on by default; press **C** to hide them and **M** to mute.
- **Live, over a screen share:** mute the narration and talk over it. The animation reads clearly with the sound off, and each line below doubles as a talking point.
- **Jumping around:** press **[** and **]** to move between the {len(chapters)} chapters, **Space** to play or pause, and **F** for full screen.
- **Hands-on:** the *Try it yourself* tab is a working copy of the form. Nothing typed there is sent anywhere.

## Script

| Time | Chapter | On screen | Narration |
|---|---|---|---|
""" + "\n".join(rows) + "\n\n" + NOTES
    (ROOT / "narration-script.md").write_text(doc)
    print("wrote narration-script.md")


if __name__ == "__main__":
    main()
