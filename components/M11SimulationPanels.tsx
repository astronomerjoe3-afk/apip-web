import M13SimulationPanels from "./M13SimulationPanels";

type Props = {
  lessonKey: string;
  simMetricMeters: number;
  setSimMetricMeters: (value: number) => void;
  simVectorMagnitude: number;
  setSimVectorMagnitude: (value: number) => void;
  simVectorAngle: number;
  setSimVectorAngle: (value: number) => void;
  simDensityMass: number;
  setSimDensityMass: (value: number) => void;
  simDensityVolume: number;
  setSimDensityVolume: (value: number) => void;
  simFluidDensity: number;
  setSimFluidDensity: (value: number) => void;
  simBias: number;
  setSimBias: (value: number) => void;
  simSpread: number;
  setSimSpread: (value: number) => void;
  formatSimulationNumber: (value: number, digits?: number) => string;
};

export default function M11SimulationPanels({
  lessonKey,
  simMetricMeters,
  setSimMetricMeters,
  simVectorMagnitude,
  setSimVectorMagnitude,
  simVectorAngle,
  setSimVectorAngle,
  simDensityMass,
  setSimDensityMass,
  simDensityVolume,
  setSimDensityVolume,
  simFluidDensity,
  setSimFluidDensity,
  simBias,
  setSimBias,
  simSpread,
  setSimSpread,
  formatSimulationNumber,
}: Props) {
  // M11 now reuses the corrected atomic-structure and radioactivity simulator implementation
  // while the dedicated M11 asset namespace is rebuilt from the stale legacy media pack.
  return (
    <M13SimulationPanels
      lessonKey={lessonKey.replace(/^M11_/, "M13_")}
      simMetricMeters={simMetricMeters}
      setSimMetricMeters={setSimMetricMeters}
      simVectorMagnitude={simVectorMagnitude}
      setSimVectorMagnitude={setSimVectorMagnitude}
      simVectorAngle={simVectorAngle}
      setSimVectorAngle={setSimVectorAngle}
      simDensityMass={simDensityMass}
      setSimDensityMass={setSimDensityMass}
      simDensityVolume={simDensityVolume}
      setSimDensityVolume={setSimDensityVolume}
      simFluidDensity={simFluidDensity}
      setSimFluidDensity={setSimFluidDensity}
      simBias={simBias}
      setSimBias={setSimBias}
      simSpread={simSpread}
      setSimSpread={setSimSpread}
      formatSimulationNumber={formatSimulationNumber}
    />
  );
}
