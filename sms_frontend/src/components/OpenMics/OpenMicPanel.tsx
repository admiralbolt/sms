import { useOpenMics } from "@/hooks/api";
import OpenMicCard from "./OpenMicCard";

const OpenMicPanel = () => {
  const openMics = useOpenMics();

  return (
    <>
      {openMics.map((mic) => (
        <OpenMicCard key={mic.id} openMic={mic} />
      ))}
    </>
  );
};

export default OpenMicPanel;