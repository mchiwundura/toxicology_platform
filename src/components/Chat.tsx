import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, Check, Phone, RotateCcw, Send, X } from "lucide-react";
import { EMERGENCY_NUMBER } from '../consts';

/* ---------- Things to fill in ---------- */
const ESCALATION_ENDPOINT = ""; // TODO: where enquiries are POSTed. Empty = log to console only.

/* Real images: add entries as you get them, keyed by the option label.
	 e.g. { Cobra: "/images/snakes/cobra.jpg", Bleach: "/images/chemicals/bleach.jpg" }
	 Anything missing falls back to a labelled placeholder. */
const IMAGES = {};
const img = (label) =>
	IMAGES[label] ??
	`https://placehold.co/320x240/ece5ff/2200a9?text=${encodeURIComponent(label)}`;

/* ---------- Small helpers to keep the tree readable ---------- */
const opts = (labels, next) => labels.map((label) => ({ label, next }));
const tiles = (labels, next) => labels.map((label) => ({ label, next, image: img(label) }));
const yesNo = (next) => opts(["Yes", "No", "Not sure"], next);
const ask = (short, message, options, extra = {}) => ({ short, message, options, ...extra });
const when = (next) =>
	opts(["Just now", "Less than 1 hour", "1 to 6 hours", "More than 6 hours"], next);

// Every poisoning or bite pathway starts by checking the person is awake and breathing.
const vitals = (next) =>
	ask("Awake and breathing", "First, is the person awake and breathing normally?", [
		{ label: "Yes, awake and breathing normally", next },
		{
			label: "No: drowsy, unresponsive, fitting or struggling to breathe",
			next: "emergencyNow",
			danger: true,
		},
	]);

/* Chemical first aid depends on how the person was exposed. */
const CHEM = {
	Swallowed: [
		"Rinse the mouth with water and spit it out.",
		"Keep the person sitting upright.",
		"Take them to a health facility and bring the container or label.",
	],
	"On the skin": [
		"Remove contaminated clothing, wearing gloves if you can.",
		"Rinse the skin with clean running water for at least 15 minutes.",
		"Get medical care if the skin is burned, blistered or very painful.",
	],
	"In the eyes": [
		"Rinse the eye with clean running water for at least 15 minutes, keeping the eyelids open.",
		"Take out contact lenses if they come out easily.",
		"Go to a health facility after rinsing.",
	],
	"Breathed in fumes": [
		"Move to fresh air straight away.",
		"Loosen tight clothing and keep the person resting.",
		"Get medical care if coughing, wheezing or breathlessness does not settle quickly.",
	],
};

/* ---------- The decision tree ----------
	 Question node: { short, message, options: [{ label, next, image?, danger? }], hint? }
	 Result node:   { end: true, short, title, steps: [] | (answers) => [], avoid?: [], tone?: "urgent" }
	 Free-text node:{ end: true, freeText: true, short, message }
	 `answers` is keyed by node id, e.g. answers.snakeType === "Cobra".
	 All advice text below is draft guidance: DATIS pharmacists should review it before launch. */
const T = {
	start: ask(
		"Topic",
		"What would you like help with?",
		[
			["Snake bite", "v_snake"],
			["Drug overdose", "v_drug"],
			["Child poisoning", "v_child"],
			["Household chemicals", "v_chem"],
			["Pesticides", "v_pest"],
			["Animal bite", "v_animal"],
			["Unknown poison", "v_unknown"],
			["Ask a question", "question"],
		].map(([label, next]) => ({ label, next, image: img(label) })),
	),

	emergencyNow: {
		end: true,
		tone: "urgent",
		short: "Emergency",
		title: "Call for emergency help now",
		steps: [
			"Call for help or get to the nearest hospital straight away.",
			"If the person is not responding but is breathing, lay them on their side.",
			"If they are not breathing, shout for help and start CPR if you are trained.",
			"Stay with them. Bring anything that may have caused this (container, packet, plant).",
		],
		avoid: ["Giving food or drink", "Making them vomit"],
	},

	/* Snake bite */
	v_snake: vitals("snakeType"),
	snakeType: ask(
		"Snake",
		"Which snake do you think it was?",
		tiles(["Cobra", "Black mamba", "Puff adder", "Boomslang", "Unknown snake"], "snakeAge"),
		{ hint: "Don’t go near the snake to identify it. A photo from a safe distance is fine." },
	),
	snakeAge: ask("Age group", "How old is the patient?", opts(["Child", "Adult"], "snakeBitten")),
	snakeBitten: ask(
		"Contact",
		"What happened?",
		opts(["Bitten", "Venom sprayed in the eyes", "No contact", "Not sure"], "snakeWhen"),
	),
	snakeWhen: ask("Time since", "How long ago was this?", when("snakeSymptoms")),
	snakeSymptoms: ask(
		"Symptoms",
		"Which of these are happening now?",
		opts(
			[
				"Pain or swelling at the bite",
				"Drooping eyelids, blurred vision or trouble speaking or swallowing",
				"Bleeding, bruising or blood in the urine",
				"None yet",
			],
			"snakeAdvice",
		),
	),
	snakeAdvice: {
		end: true,
		tone: "urgent",
		short: "Advice",
		title: "Get to a hospital now, even if the person feels fine",
		steps: (a) => [
			"Move away from the snake. Keep the person calm and as still as possible.",
			"Keep the bitten limb still, at about heart level. Take off rings, watches and tight clothing before swelling starts.",
			a.snakeBitten === "Venom sprayed in the eyes" &&
			"Rinse the eyes with plenty of clean water for at least 15 minutes on the way.",
			"Go to the nearest hospital or clinic. Call ahead if you can.",
			"Note the time of the bite and any new symptoms.",
		],
		avoid: [
			"Cutting, sucking or squeezing the wound",
			"Tight tourniquets",
			"Ice, herbs or traditional remedies",
			"Trying to catch or kill the snake",
		],
	},

	/* Drug overdose */
	v_drug: vitals("drugName"),
	drugName: ask(
		"Medicine",
		"Which medicine was involved?",
		opts(
			[
				"Paracetamol",
				"Aspirin",
				"Ibuprofen",
				"Antimalarial",
				"Blood pressure or heart tablets",
				"Diabetes tablets",
				"Other or unknown",
			],
			"drugAge",
		),
		{ hint: "Keep the packet or bottle to show the health worker." },
	),
	drugAge: ask("Age group", "How old is the patient?", opts(["Child", "Adult"], "drugWeight")),
	drugWeight: ask(
		"Weight",
		"About how much does the patient weigh?",
		opts(["Less than 10 kg", "10 to 30 kg", "Above 30 kg", "Not sure"], "drugAmount"),
	),
	drugAmount: ask(
		"Amount",
		"About how much was taken?",
		opts(["Small amount", "Large amount", "Unknown"], "drugIntent"),
	),
	drugIntent: ask(
		"On purpose",
		"Was it taken on purpose?",
		opts(["No, by accident", "Yes, on purpose", "Not sure"], "drugTime"),
	),
	drugTime: ask("Time since", "How long ago was it taken?", when("drugAdvice")),
	drugAdvice: {
		end: true,
		tone: "urgent",
		short: "Advice",
		title: "Get medical help now",
		steps: (a) => [
			"Take the person to a hospital or clinic for assessment. Some medicines, like paracetamol, can cause serious harm even when the person feels well at first.",
			"Bring the packet, bottle or any tablets left over.",
			"Tell the health worker what was taken, roughly how much, and when.",
			a.drugIntent === "Yes, on purpose" &&
			"Stay with the person and do not leave them alone. They need urgent medical assessment and support.",
		],
		avoid: ["Making the person vomit", "Giving salt water, milk or traditional remedies"],
	},

	/* Child poisoning */
	v_child: vitals("childAge"),
	childAge: ask(
		"Child’s age",
		"How old is the child?",
		opts(["Under 1 year", "1 to 5 years", "6 to 12 years"], "childWhat"),
	),
	childWhat: ask(
		"Swallowed",
		"What do you think the child swallowed or touched?",
		tiles(
			[
				"Medicine",
				"Cleaning product",
				"Pesticide or rat poison",
				"Plant or berries",
				"Button battery",
				"Not sure",
			],
			"childTime",
		),
	),
	childTime: ask("Time since", "How long ago was this?", when("childAdvice")),
	childAdvice: {
		end: true,
		tone: "urgent",
		short: "Advice",
		title: "Take the child to a health facility now",
		steps: (a) => [
			a.childWhat === "Button battery" &&
			"A swallowed button battery is an emergency. Go to hospital immediately, even if the child seems well.",
			"Wipe out anything you can see in the mouth and keep the child upright.",
			"Bring the container, packet or a piece of the plant.",
			"Tell the health worker what the child may have swallowed and when.",
		],
		avoid: [
			"Making the child vomit",
			"Giving food or drink unless a health worker tells you to",
			"Waiting for symptoms to appear",
		],
	},

	/* Household chemicals */
	v_chem: vitals("chemType"),
	chemType: ask(
		"Chemical",
		"Which product was it?",
		tiles(
			[
				"Bleach",
				"Paraffin or kerosene",
				"Drain or oven cleaner",
				"Dishwashing or laundry liquid",
				"Other or unknown",
			],
			"chemRoute",
		),
		{ hint: "Keep the container. The label helps the pharmacist." },
	),
	chemRoute: ask(
		"Exposure",
		"How was the person exposed?",
		opts(["Swallowed", "On the skin", "In the eyes", "Breathed in fumes"], "chemTime"),
	),
	chemTime: ask("Time since", "How long ago was this?", when("chemAdvice")),
	chemAdvice: {
		end: true,
		tone: "urgent",
		short: "Advice",
		title: "Do this now, then get medical advice",
		steps: (a) => CHEM[a.chemRoute] ?? CHEM.Swallowed,
		avoid: ["Making the person vomit", "Trying to neutralise the chemical with other products"],
	},

	/* Pesticides */
	v_pest: vitals("pestType"),
	pestType: ask(
		"Pesticide",
		"What kind of product was it?",
		tiles(
			["Insecticide or crop spray", "Rat poison", "Weed killer", "Dip or tick grease", "Other or unknown"],
			"pestRoute",
		),
		{ hint: "Keep the container or take a photo of the label." },
	),
	pestRoute: ask(
		"Exposure",
		"How was the person exposed?",
		opts(["Swallowed", "On the skin", "In the eyes", "Breathed in"], "pestSymptoms"),
	),
	pestSymptoms: ask(
		"Symptoms",
		"Which of these are happening now?",
		opts(
			[
				"Heavy sweating, drooling or vomiting",
				"Muscle twitching or weakness",
				"Headache or dizziness",
				"Nothing yet",
			],
			"pestTime",
		),
	),
	pestTime: ask("Time since", "How long ago was this?", when("pestAdvice")),
	pestAdvice: {
		end: true,
		tone: "urgent",
		short: "Advice",
		title: "Get medical help now",
		steps: [
			"Whoever helps should wear gloves and avoid touching the poison.",
			"Take off contaminated clothing and wash the skin and hair well with soap and water.",
			"If it is in the eyes, rinse with clean water for at least 15 minutes. If breathed in, move to fresh air.",
			"Go to a health facility and take the container, label or a photo of it.",
		],
		avoid: ["Making the person vomit", "Letting them return to the sprayed area or keep working"],
	},

	/* Animal bite */
	v_animal: vitals("animalType"),
	animalType: ask(
		"Animal",
		"Which animal was it?",
		tiles(["Dog", "Cat", "Bat", "Monkey", "Other or unknown"], "animalStatus"),
	),
	animalStatus: ask(
		"Animal status",
		"Do you know about the animal?",
		opts(
			["Pet, vaccinated against rabies", "Pet, not vaccinated or not sure", "Stray or wild animal"],
			"animalWound",
		),
	),
	animalWound: ask(
		"Wound",
		"What does the skin look like?",
		opts(["Broken or bleeding", "Scratch or lick on broken skin", "Not broken"], "animalAdvice"),
	),
	animalAdvice: {
		end: true,
		short: "Advice",
		title: "See a clinic today to be assessed for rabies",
		steps: [
			"Wash the wound well with soap and running water for at least 15 minutes.",
			"Cover it loosely with a clean cloth.",
			"Go to a clinic today for assessment for rabies and tetanus. Treatment works best when started early.",
			"Note where the animal lives or was last seen.",
		],
		avoid: ["Closing the wound tightly", "Waiting to see if symptoms develop"],
	},

	/* Unknown poison */
	v_unknown: vitals("unkHow"),
	unkHow: ask(
		"What happened",
		"What do you think happened?",
		opts(
			["Swallowed something", "Contact with skin or eyes", "Breathed in fumes or smoke", "Bitten or stung", "Not sure"],
			"unkSymptoms",
		),
	),
	unkSymptoms: ask(
		"Symptoms",
		"Which of these are happening now?",
		opts(
			[
				"Vomiting or stomach pain",
				"Drowsy or confused",
				"Trouble breathing",
				"Rash, burns or irritation",
				"No symptoms",
			],
			"unkTime",
		),
	),
	unkTime: ask("Time since", "How long ago was this?", when("unkAdvice")),
	unkAdvice: {
		end: true,
		tone: "urgent",
		short: "Advice",
		title: "Get medical advice now",
		steps: [
			"Move the person away from the source and into fresh air.",
			"If skin or eyes were exposed, rinse with clean water for at least 15 minutes.",
			"Take anything that might be the cause (container, plant, food) to the health facility.",
			"Go to a health facility. A pharmacist here will review what you send.",
		],
		avoid: ["Making the person vomit", "Giving food or drink"],
	},

	/* Free-text question */
	question: {
		end: true,
		freeText: true,
		short: "Question",
		message: "Type your question below. A pharmacist will review it and reply.",
	},
};

/* ---------- Pieces ---------- */
function Advice({ node, answers }) {
	const steps = (typeof node.steps === "function" ? node.steps(answers) : node.steps).filter(Boolean);
	const urgent = node.tone === "urgent";
	return (
		<div className={`chat-advice${urgent ? " chat-advice--urgent" : ""}`}>
			<h3>{node.title}</h3>
			{urgent && (
				<a className="btn btn-emergency chat-call" href={`tel:${EMERGENCY_NUMBER.replace(/\s/g, "")}`}>
					<Phone size={18} /> Call {EMERGENCY_NUMBER}
				</a>
			)}
			<ol>
				{steps.map((s) => (
					<li key={s}>{s}</li>
				))}
			</ol>
			{node.avoid && (
				<div className="chat-avoid">
					<p>Please do not:</p>
					<ul>
						{node.avoid.map((a) => (
							<li key={a}>
								<X size={16} aria-hidden="true" />
								<span>{a}</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

export default function Chat() {
	const [trail, setTrail] = useState([]); // [{ id, label, next }]
	const [contact, setContact] = useState("");
	const [note, setNote] = useState("");
	const [status, setStatus] = useState("idle"); // idle | sending | sent | error
	const bodyRef = useRef(null);
	const blockRef = useRef(null);

	const current = trail.length ? trail[trail.length - 1].next : "start";
	const node = T[current];
	const answers = Object.fromEntries(trail.map((t) => [t.id, t.label]));
	const hasImages = node.options?.some((o) => o.image);
	const locked = status === "sending" || status === "sent";

	// Bring the newest question into view inside the chat only (never scrolls the page).
	useEffect(() => {
		const body = bodyRef.current;
		const block = blockRef.current;
		if (!body || !block) return;
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		body.scrollTo({ top: Math.max(block.offsetTop - 12, 0), behavior: reduce ? "auto" : "smooth" });
	}, [current, status]);

	function choose(option) {
		setTrail([...trail, { id: current, label: option.label, next: option.next }]);
	}

	function back() {
		setTrail(trail.slice(0, -1));
		setStatus("idle");
	}

	function restart() {
		setTrail([]);
		setContact("");
		setNote("");
		setStatus("idle");
	}

	async function send() {
		const payload = {
			category: trail[0]?.label ?? "Question",
			outcome: node.title ?? "Question",
			answers: trail.map((t) => ({ question: T[t.id].short, answer: t.label })),
			contact: contact.trim() || null,
			note: note.trim() || null,
			sentAt: new Date().toISOString(),
		};
		setStatus("sending");
		try {
			if (ESCALATION_ENDPOINT) {
				const res = await fetch(ESCALATION_ENDPOINT, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
				if (!res.ok) throw new Error(`Request failed: ${res.status}`);
			} else {
				console.log("Escalation payload", payload);
			}
			setStatus("sent");
		} catch {
			setStatus("error");
		}
	}

	return (
		<section className="chat" aria-label="DATIS assistant">
			<header className="chat-head">
				{trail.length > 0 && !locked && (
					<button className="chat-icon-btn" onClick={back} aria-label="Go back one step">
						<ArrowLeft size={20} />
					</button>
				)}
				<div className="chat-title">
					<h2>DATIS Assistant</h2>
					<small>Poison and medicine information</small>
				</div>
				{trail.length > 0 && (
					<button className="chat-icon-btn" onClick={restart} aria-label="Start over">
						<RotateCcw size={18} />
					</button>
				)}
			</header>

			<a className="chat-emergency" href={`tel:${EMERGENCY_NUMBER.replace(/\s/g, "")}`}>
				<AlertTriangle size={18} aria-hidden="true" />
				<span>Not breathing, unconscious or fitting? Call {EMERGENCY_NUMBER} now.</span>
			</a>

			<div className="chat-body" ref={bodyRef} role="log" aria-live="polite">
				{trail.map((t, i) => (
					<div className="chat-turn" key={i}>
						<div className="chat-bot">{T[t.id].message}</div>
						<div className="chat-user">{t.label}</div>
					</div>
				))}

				<div className="chat-block" key={current} ref={blockRef}>
					{node.message && (
						<div className="chat-bot">
							{node.message}
							{node.hint && <p className="chat-hint">{node.hint}</p>}
						</div>
					)}

					{node.options && (
						<div className={hasImages ? "chat-tiles" : "chat-options"}>
							{node.options.map((o, i) =>
								hasImages ? (
									<button key={o.label} className="chat-tile" style={{ "--i": i }} onClick={() => choose(o)}>
										<img src={o.image} alt="" width="320" height="240" loading="lazy" />
										<span>{o.label}</span>
									</button>
								) : (
									<button
										key={o.label}
										className={`chat-opt${o.danger ? " chat-opt--danger" : ""}`}
										style={{ "--i": i }}
										onClick={() => choose(o)}
									>
										{o.label}
									</button>
								),
							)}
						</div>
					)}

					{node.end && (
						<>
							{node.steps && <Advice node={node} answers={answers} />}

							{status === "sent" ? (
								<div className="chat-sent">
									<Check size={20} aria-hidden="true" />
									<div>
										<strong>Sent to the Information Service.</strong>
										<p>
											A pharmacist will review this{contact.trim() ? " and contact you" : ""}. In an emergency,
											don’t wait for a reply.
										</p>
										<button className="chat-link" onClick={restart}>
											Start a new enquiry
										</button>
									</div>
								</div>
							) : (
								<div className="chat-escalate">
									<h3>{node.freeText ? "Send your question" : "Send this to a pharmacist"}</h3>
									{trail.length > 0 && (
										<details>
											<summary>What you’ve told us</summary>
											<dl>
												{trail.map((t, i) => (
													<div key={i}>
														<dt>{T[t.id].short}</dt>
														<dd>{t.label}</dd>
													</div>
												))}
											</dl>
										</details>
									)}
									<label>
										{node.freeText ? "Your question" : "Anything else we should know? (optional)"}
										<textarea
											rows={node.freeText ? 4 : 2}
											value={note}
											onChange={(e) => setNote(e.target.value)}
											disabled={locked}
										/>
									</label>
									<label>
										Phone or WhatsApp number (optional)
										<input
											type="tel"
											inputMode="tel"
											value={contact}
											onChange={(e) => setContact(e.target.value)}
											disabled={locked}
											placeholder="So a pharmacist can call you back"
										/>
									</label>
									{status === "error" && (
										<p className="chat-error">
											That didn’t send. Check your connection and try again, or call {EMERGENCY_NUMBER}.
										</p>
									)}
									<button
										className="btn btn-violet chat-send"
										onClick={send}
										disabled={locked || (node.freeText && !note.trim())}
									>
										<Send size={18} aria-hidden="true" />
										{status === "sending" ? "Sending…" : "Send to a pharmacist"}
									</button>
								</div>
							)}
						</>
					)}
				</div>
			</div>

			<footer className="chat-foot">
				First-aid guidance only. This does not replace care from a health worker.
			</footer>
		</section>
	);
}
