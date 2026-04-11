import M12SimulationPanels from "./M12SimulationPanels";

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

export default function M10SimulationPanels({
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
  return (
    <M12SimulationPanels
      lessonKey={lessonKey.replace(/^M10_/, "M12_")}
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
