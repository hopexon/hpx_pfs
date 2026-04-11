"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import IntervalUsage from "@/components/tools/interval/IntervalUsage";

import scalesJson from "@/app/tools/interval/json/scales.json";
import tuningsJson from "@/app/tools/interval/json/tunings.json";

import styles from "@/app/tools/interval/interval.module.css";

// = tuningpresetname<stringnumber(※string), noteindex(0~11)>
type TuningMap = Record<string, Record<string, number>>;
type ScaleDefinition = {
  rootIndex: number;
  intervals: number[];
};
type ScaleMap = Record<string, ScaleDefinition>;
type Handedness = "left" | "right";

type IntervalToolProps = {
  handedness?: Handedness;
  onHandednessChange?: (value: Handedness) => void;
};

const tunings = tuningsJson as TuningMap;
const scales = scalesJson as ScaleMap;
const FRET_COUNT = 24;
const defaultStringCount = 6;
const pitchNames = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "Bb",
  "B",
] as const;
type PitchName = (typeof pitchNames)[number];

const scaleGroups = [
  { root: "C", items: ["CM", "CM Penta", "Cm Penta"] },
  { root: "D", items: ["D Major"] },
  { root: "E", items: ["EM Penta", "Em Penta"] },
  { root: "A", items: ["AM Penta", "Am Penta"] },
];

const markedFrets = new Set([3, 5, 7, 9, 12, 15, 17, 19, 21]);

// interval names mapped by mod12 index (0・11)
// tension notation is used for 2nd→9, 4th→11, #4→#11, 6th→13
const basicIntervalNames: Record<number, string> = {
  0: "1",
  1: "b2",
  2: "9",
  3: "b3",
  4: "3",
  5: "11",
  6: "b5(#11)",
  7: "5",
  8: "b6(#5)",
  9: "13",
  10: "b7",
  11: "7",
};

// a function to count pitch index with mod 12 (probably it'll never be changed)
function mod12(value: number): number {
  return ((value % 12) + 12) % 12;
}

// returns interval name string based on semitone distance from the root
function getIntervalName(semitoneDistance: number): string {
  return basicIntervalNames[mod12(semitoneDistance)] ?? "";
}

// display labels for fret cells (some intervals need multi-line display)
const intervalFretLabels: Record<string, string> = {
  "b5(#11)": "b5\n(#11)",
  "b6(#5)": "b6\n(#5)",
};

// all toggleable interval names (root '1' is always visible)
const intervalToggleNames = [
  "b2",
  "9",
  "b3",
  "3",
  "11",
  "b5(#11)",
  "5",
  "b6(#5)",
  "13",
  "b7",
  "7",
] as const;
type IntervalName = (typeof intervalToggleNames)[number];

const defaultHiddenIntervalSet = [
  "b2",
  "b3",
  "b5(#11)",
  "b6(#5)",
  "b7",
] as const satisfies readonly IntervalName[];

const createDefaultHiddenIntervalSet = () =>
  new Set<IntervalName>(defaultHiddenIntervalSet);

// if the app lost default tuning, all strings will be set to C(0)
function createDefaultStringRoots(stringCount: number): number[] {
  return Array.from({ length: stringCount }, () => 0);
}

// a function to create strings root from presets you defined in tunings.json
function createStringRootsByTuning(
  tuningName: string,
  stringCount: number,
): number[] {
  const tuning = tunings[tuningName]; // get tuning by tuningName from tunings.json
  if (!tuning) {
    return createDefaultStringRoots(stringCount); // if the tuning is not found, createDefaultStringRoots will be used as fallback
  }

  return Array.from({ length: stringCount }, (_, idx) => {
    // start to end
    const value = tuning[String(idx + 1)]; // add 1 because string number starts from 1 in tunings.json
    if (typeof value !== "number") {
      return 0;
    }
    return mod12(value);
  });
}

const presetNames = Object.keys(tunings);
// standard tuning is set as default
const defaultPresetName = presetNames.includes("Standard")
  ? "Standard"
  : (presetNames[0] ?? "");

// 本丸
export function IntervalTool({
  handedness: handednessProp, // handedness state passed from parent(IntervalPageClient.tsx)
  onHandednessChange, // function to update handedness state in parent(IntervalPageClient.tsx)
}: IntervalToolProps = {}) {
  const [stringCount, setStringCount] = useState(defaultStringCount);
  const [selectedTuning, setSelectedTuning] =
    useState<string>(defaultPresetName); // default preset will be activated at first
  const [selectedScale, setSelectedScale] = useState<string | null>(null); // no scale will be selected at first
  const [hiddenPitchSet, setHiddenPitchSet] = useState<Set<PitchName>>(
    new Set(),
  ); // no pitch will be hidden at first
  const [selectedStringRoots, setSelectedStringRoots] = useState<number[]>(
    createStringRootsByTuning(defaultPresetName, defaultStringCount),
  ); // default each string root will be activated with selectedTuning)
  const [intervalModeTarget, setIntervalModeTarget] = useState<{
    stringNo: number;
    fretNo: number;
  } | null>(null); // interval display mode: when a fret is clicked, show degree names relative to that fret
  const isIntervalMode = intervalModeTarget !== null;
  const [hiddenIntervalSet, setHiddenIntervalSet] = useState<Set<IntervalName>>(
    () => createDefaultHiddenIntervalSet(),
  ); // interval display mode: set of hidden intervals, default to defaultHiddenIntervalSet
  const [internalHandedness, setInternalHandedness] =
    useState<Handedness>("left"); // fallback for the time when this component is used standalone(without props from parent)(not necessary)
  const handedness = handednessProp ?? internalHandedness;
  const fretMapWrapRef = useRef<HTMLDivElement | null>(null);

  const fretNumbers = useMemo(() => {
    if (handedness === "left") {
      return Array.from({ length: FRET_COUNT }, (_, idx) => FRET_COUNT - idx); // end to start
    }

    return Array.from({ length: FRET_COUNT }, (_, idx) => idx + 1); // start to end
  }, [handedness]); // re-calculate if handedness is changed (to righty)

  const stringNumbers = useMemo(
    () => Array.from({ length: stringCount }, (_, idx) => idx + 1),
    [stringCount],
  ); // start to end

  /*
  ex) in default settings
  stringNumbers: [1, 2, 3, 4, 5, 6] ※string number starts from 1
  selectedStringRoots: [4, 11, 7, 2, 9, 4] (Standard Tuning EADGBE) ※ index starts from 0
  pitchName[selectedStringRoots[1 - 1]] = pitchName[0] = E for string 1
  */
  const rootItems = useMemo(
    () =>
      stringNumbers.map(
        (stringNo) => pitchNames[selectedStringRoots[stringNo - 1] ?? 0],
      ),
    [selectedStringRoots, stringNumbers], // re-calculate if selectedStringRoots or stringNumbers is changed (to update root note names)
  );

  // calculate pitch index set in selected scale for later use to check whether the pitch in fret map is in scale or not
  const scalePitchIndexSet = useMemo(() => {
    if (!selectedScale) {
      return null;
    }

    const scale = scales[selectedScale];
    if (!scale) {
      return null;
    }

    return new Set(
      scale.intervals.map((interval) => mod12(scale.rootIndex + interval)),
    );
  }, [selectedScale]);

  // calculate disabled pitch set by selected scale for later use to check whether the pitch in fret map is disabled or not
  const disabledPitchSetByScale = useMemo(() => {
    if (!scalePitchIndexSet) {
      return new Set<PitchName>(); // if no scale is selected, return an empty set
    }

    // calculate disabled pitch set by scalePitchIndexSet, if scalePitchIndexSet is not null
    return new Set(
      pitchNames.filter(
        (_, pitchIndex) => !scalePitchIndexSet.has(pitchIndex),
      ) as PitchName[],
    );
  }, [scalePitchIndexSet]);

  // pitch index of the interval mode root (mod12, since all intervals use tension notation)
  const intervalModeRootPitch = useMemo(() => {
    if (!intervalModeTarget) return null;
    const rootIndex = selectedStringRoots[intervalModeTarget.stringNo - 1] ?? 0;
    return mod12(rootIndex + intervalModeTarget.fretNo);
  }, [intervalModeTarget, selectedStringRoots]);

  const intervalRootName = useMemo(() => {
    if (intervalModeRootPitch === null) return "";
    return pitchNames[intervalModeRootPitch];
  }, [intervalModeRootPitch]);

  const handleTuningClick = (tuningName: string) => {
    setSelectedTuning(tuningName);
    setSelectedScale(null);
    setHiddenPitchSet(new Set());
    setSelectedStringRoots(createStringRootsByTuning(tuningName, stringCount));
  };

  const handleScaleChange = (value: string) => {
    if (!value) {
      setSelectedScale(null);
      setHiddenPitchSet(new Set());
      return;
    }

    setSelectedScale(value);
    setHiddenPitchSet(new Set()); // initialize hidden pitch set
  };

  const handleResetScale = () => {
    setSelectedScale(null);
    setHiddenPitchSet(new Set());
  };

  // ※setHiddenPitchset and disablePitchSet are different flags
  // setHidden is indipendent from disablePitchset
  const handlePitchToggle = (pitch: PitchName) => {
    if (disabledPitchSetByScale.has(pitch)) {
      // deny toggle if the pitch is disabled by scale
      return;
    }

    setHiddenPitchSet((prev) => {
      const next = new Set(prev); // avoid updating prev directly
      if (next.has(pitch)) {
        next.delete(pitch); // activate clicked pitch
      } else {
        next.add(pitch); // deactivate clicked pitch
      }
      return next;
    });
  };

  const handleHideAll = () => {
    setHiddenPitchSet(new Set(pitchNames));
  };

  const handleResetPitch = () => {
    setHiddenPitchSet(new Set());
  };

  // interval display mode: toggle individual interval visibility
  const handleIntervalToggle = (name: IntervalName) => {
    setHiddenIntervalSet((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const handleIntervalHideAll = () => {
    setHiddenIntervalSet(new Set(intervalToggleNames));
  };

  const handleIntervalReset = () => {
    setHiddenIntervalSet(() => createDefaultHiddenIntervalSet());
  };

  const handleRootChange = (stringNo: number, value: number) => {
    setSelectedStringRoots((prev) => {
      const next = [...prev];
      next[stringNo - 1] = mod12(value);
      return next;
    });
  };

  const handleHandednessChange = (value: Handedness) => {
    if (!handednessProp) {
      setInternalHandedness(value);
    }
    onHandednessChange?.(value);
  };

  // interval display mode: click a fret to set it as root, click again to exit
  const handleFretClick = (stringNo: number, fretNo: number) => {
    if (
      intervalModeTarget &&
      intervalModeTarget.stringNo === stringNo &&
      intervalModeTarget.fretNo === fretNo
    ) {
      setIntervalModeTarget(null); // exit interval mode
    } else {
      setHiddenIntervalSet(() => createDefaultHiddenIntervalSet()); // reset hidden intervals when entering interval mode
      setIntervalModeTarget({ stringNo, fretNo }); // enter / switch root
    }
  };

  const handleChangeStringCount = (delta: number) => {
    setStringCount((prev) => {
      const next = prev + delta;

      // when string count is changed, update selectedStringRoots to match the new string count
      setSelectedStringRoots(() => {
        const newRoots = createStringRootsByTuning(selectedTuning, next); // get new roots based on the new string count and current tuning
        return newRoots;
      });
      return next;
    });
  };

  // to scroll fretmap to left or right edge when handedness is changed
  useEffect(() => {
    const wrap = fretMapWrapRef.current;
    if (!wrap) return;

    let fallbackTimer: number | null = null;
    const rafId = requestAnimationFrame(() => {
      const maxScrollLeft = Math.max(0, wrap.scrollWidth - wrap.clientWidth);
      if (maxScrollLeft <= 0) return;

      const targetLeft = handedness === "left" ? maxScrollLeft : 0;
      if (Math.abs(wrap.scrollLeft - targetLeft) <= 1) return;

      wrap.scrollTo({ left: targetLeft, behavior: "smooth" });

      fallbackTimer = window.setTimeout(() => {
        const latestMaxScrollLeft = Math.max(
          0,
          wrap.scrollWidth - wrap.clientWidth,
        );
        const latestTargetLeft =
          handedness === "left" ? latestMaxScrollLeft : 0;

        if (Math.abs(wrap.scrollLeft - latestTargetLeft) > 1) {
          wrap.scrollTo({ left: latestTargetLeft, behavior: "auto" });
        }
      }, 220);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer);
      }
    };
  }, [handedness]);

  const fretMapPanel = (
    <div className={styles.fret__map}>
      <AnimatePresence>
        {stringNumbers.map((stringNo) => (
          // 'key' attr must be added to the first element of map function
          <motion.div
            key={`line_${stringNo}`}
            className={styles.fret__line}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {fretNumbers.map((fretNo) => {
              const rootIndex = selectedStringRoots[stringNo - 1] ?? 0; // get root index
              const pitchIndex = mod12(rootIndex + fretNo); // calculate each fret's pitch index from rootIndex
              const note = pitchNames[pitchIndex]; // get pitch name from pitchIndex

              // interval display mode: show degree names relative to the clicked fret
              if (isIntervalMode && intervalModeRootPitch !== null) {
                const semitoneDistance = pitchIndex - intervalModeRootPitch;
                const intervalName = getIntervalName(semitoneDistance);
                const isRoot =
                  intervalModeTarget.stringNo === stringNo &&
                  intervalModeTarget.fretNo === fretNo;
                const isHiddenInterval =
                  intervalName !== "1" &&
                  hiddenIntervalSet.has(intervalName as IntervalName); // root '1' is always visible, other intervals can be toggled
                const isVisible = !isHiddenInterval;

                return (
                  <div
                    key={`fret_${stringNo}_${fretNo}`}
                    className={[
                      styles.fret__item,
                      isVisible ? styles.fret__color : "",
                      isRoot ? styles.interval__mode__root : "",
                    ].join(" ")}
                    data-interval={isVisible ? intervalName : undefined}
                    onClick={() => handleFretClick(stringNo, fretNo)}
                  >
                    <span
                      className={`${styles.fret__pitch__name} ${styles.interval__name}`}
                    >
                      {isVisible
                        ? (intervalFretLabels[intervalName] ?? intervalName)
                        : ""}
                    </span>
                  </div>
                );
              }

              // normal mode
              const isInScale =
                !scalePitchIndexSet || scalePitchIndexSet.has(pitchIndex); // check wheter the pitch is in scale
              const hidden = hiddenPitchSet.has(note); // check whether the pitch is hidden by user toggle
              const isVisible = Boolean(selectedTuning) && isInScale && !hidden; // the pitch will be visible if tuning is selected and the pitch is in scale(or any scales is selected) and not hidden by user toggle

              return (
                <div
                  key={`fret_${stringNo}_${fretNo}`}
                  className={[
                    styles.fret__item,
                    isVisible ? styles.fret__color : "",
                  ].join(" ")}
                  data-note={isVisible ? note : undefined}
                  onClick={() => handleFretClick(stringNo, fretNo)}
                >
                  <span className={styles.fret__pitch__name}>
                    {isVisible ? note : ""}
                  </span>
                </div>
              );
            })}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className={styles.fret__number}>
        {fretNumbers.map((fretNo) => {
          const marked = markedFrets.has(fretNo);
          return (
            <div
              key={`number_${fretNo}`}
              className={`${styles.number__item} ${marked ? styles.fret__mark : ""}`}
            >
              {fretNo}
            </div>
          );
        })}
      </div>
    </div>
  );

  const rootPanel = (
    <div className={styles.root__wrap}>
      {rootItems.map((rootValue, idx) => (
        <div key={`root_${idx + 1}`} className={styles.root__item}>
          <span className={styles.root__pitch}>
            {selectedTuning ? rootValue : ""}
          </span>
        </div>
      ))}
    </div>
  );

  const modeName = isIntervalMode ? (
    <div className={styles.mode__name}>
      <h2>
        MODE: Interval{" "}
        <span className={styles.mode__rootname}>Root: {intervalRootName}</span>
      </h2>
    </div>
  ) : null;

  return (
    <div className={styles.content__wrap}>
      <div
        className={`${styles.layout__selector__wrap} ${isIntervalMode ? styles.section__disabled : ""}`}
      >
        <div className={styles.selects__ttl}>
          <h2>Layout</h2>
        </div>
        <div className={styles.select__layout}>
          <button
            type="button"
            className={`${styles.select__btn} ${styles.layout__btn} ${handedness === "left" ? styles.js__layout__active : ""}`}
            disabled={isIntervalMode}
            onClick={() => handleHandednessChange("left")}
          >
            Lefty
          </button>
          <button
            type="button"
            className={`${styles.select__btn} ${styles.layout__btn} ${handedness === "right" ? styles.js__layout__active : ""}`}
            disabled={isIntervalMode}
            onClick={() => handleHandednessChange("right")}
          >
            Righty
          </button>
        </div>
      </div>

      <div
        className={`${styles.selects__ttl} ${isIntervalMode ? styles.section__disabled : ""}`}
      >
        <h2>Strings：{stringCount}</h2>
      </div>
      <div className={styles.strings__number__selector__wrap}>
        <button
          type="button"
          className={`${styles.select__btn} ${styles.strings__number__btn}`}
          disabled={isIntervalMode || stringCount >= 9}
          onClick={() => handleChangeStringCount(+1)}
        >
          +
        </button>
        <button
          type="button"
          className={`${styles.select__btn} ${styles.strings__number__btn}`}
          disabled={isIntervalMode || stringCount <= 4}
          onClick={() => handleChangeStringCount(-1)}
        >
          -
        </button>
      </div>

      <div
        className={`${styles.selects__ttl} ${isIntervalMode ? styles.section__disabled : ""}`}
      >
        <h2>Root</h2>
      </div>
      <div
        className={`${styles.root__selector__wrap} ${isIntervalMode ? styles.section__disabled : ""}`}
      >
        <AnimatePresence>
          {stringNumbers.map((stringNo) => (
            <motion.div
              key={`root_selector_${stringNo}`}
              className={styles.root__selector}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div
                className={styles.root__selector__label}
              >{`Str ${stringNo}`}</div>
              <select
                className={`${styles.select__btn} ${styles.root__select__btn}`}
                value={selectedStringRoots[stringNo - 1] ?? 0}
                disabled={isIntervalMode}
                onChange={(event) =>
                  handleRootChange(stringNo, Number(event.target.value))
                }
              >
                {pitchNames.map((pitch, idx) => (
                  <option key={`${stringNo}_${pitch}`} value={idx}>
                    {`${pitch}`}
                  </option>
                ))}
              </select>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* activate if presets(other than standard) is mounted */}
      <div
        className={`${styles.selects__ttl} ${isIntervalMode ? styles.section__disabled : ""}`}
      >
        <h2>Tuning Preset</h2>
      </div>
      <div
        className={`${styles.select__preset} ${isIntervalMode ? styles.section__disabled : ""}`}
      >
        {presetNames.map((tuningName) => (
          <button
            key={tuningName}
            type="button"
            className={`${styles.select__btn} ${styles.preset__btn}`}
            disabled={isIntervalMode}
            onClick={() => handleTuningClick(tuningName)}
          >
            {tuningName}
          </button>
        ))}
      </div>

      <div
        className={`${styles.fret__map__outer} ${isIntervalMode ? styles.fret__map__interval : ""}`}
      >
        {modeName}
        <div
          ref={fretMapWrapRef}
          className={`${styles.fret__map__wrap} js-map_wrap_1`}
        >
          {handedness === "left" ? (
            <>
              {fretMapPanel}
              {rootPanel}
            </>
          ) : (
            <>
              {rootPanel}
              {fretMapPanel}
            </>
          )}
        </div>
      </div>

      {isIntervalMode ? (
        <>
          <div className={styles.selects__ttl}>
            <h2>Interval</h2>
          </div>
          <div className={styles.select__pitch}>
            {intervalToggleNames.map((name) => {
              const active = !hiddenIntervalSet.has(name);
              return (
                <button
                  key={name}
                  type="button"
                  className={`${styles.pitch__btn} ${active ? styles.js__pitch__active : ""}`}
                  onClick={() => handleIntervalToggle(name)}
                >
                  {name}
                </button>
              );
            })}
            <button
              type="button"
              className={styles.pitch__btn}
              onClick={handleIntervalHideAll}
            >
              HideAll
            </button>
            <button
              type="button"
              className={styles.pitch__btn}
              onClick={handleIntervalReset}
            >
              Reset
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.selects__ttl}>
            <h2>Pitch</h2>
          </div>
          <div className={styles.select__pitch}>
            {pitchNames.map((pitch) => {
              const isDisabledByScale = disabledPitchSetByScale.has(pitch);
              const active = !isDisabledByScale && !hiddenPitchSet.has(pitch);
              return (
                <button
                  key={pitch}
                  type="button"
                  className={`${styles.pitch__btn} ${active ? styles.js__pitch__active : ""} ${isDisabledByScale ? styles.is__pitch__disabled : ""}`}
                  disabled={isDisabledByScale}
                  onClick={() => handlePitchToggle(pitch)}
                >
                  {pitch}
                </button>
              );
            })}
            <button
              type="button"
              className={styles.pitch__btn}
              onClick={handleHideAll}
            >
              HideAll
            </button>
            <button
              type="button"
              className={styles.pitch__btn}
              onClick={handleResetPitch}
            >
              Reset
            </button>
          </div>
        </>
      )}

      <div
        className={`${styles.selects__ttl} ${isIntervalMode ? styles.section__disabled : ""}`}
      >
        <h2>Scale</h2>
      </div>
      <div
        className={`${styles.scale__selector__wrap} ${isIntervalMode ? styles.section__disabled : ""}`}
      >
        {scaleGroups.map((group) => (
          <div
            key={group.root}
            className={`${styles.scale__selector} ${selectedScale && group.items.includes(selectedScale) ? styles.js__scale__active : ""}`}
          >
            <select
              className={styles.scale__btn}
              value={
                selectedScale && group.items.includes(selectedScale)
                  ? selectedScale
                  : ""
              }
              disabled={isIntervalMode}
              onChange={(event) => handleScaleChange(event.target.value)}
            >
              <option value="">{group.root}</option>
              {group.items.map((scaleName) => (
                <option key={scaleName} value={scaleName}>
                  {scaleName}
                </option>
              ))}
            </select>
          </div>
        ))}

        <button
          type="button"
          className={styles.scale__btn}
          disabled={isIntervalMode}
          onClick={handleResetScale}
        >
          Reset
        </button>
      </div>
      <IntervalUsage />
    </div>
  );
}
