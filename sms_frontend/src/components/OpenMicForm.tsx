import { OpenMic } from "@/types";

interface Props {
  openMic: OpenMic;
}

const OpenMicForm = ({ openMic }: Props) => {
  return (
    <div>
      {Object.keys(openMic).map((key) => (
        <p key={key}>{key} - {openMic[key]}</p>
      ))}
    </div>
  );
};

export default OpenMicForm;