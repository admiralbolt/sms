import { OpenMic } from "@/types";

interface Props {
  openMic: OpenMic;
}

export const OpenMicForm = ({ openMic }: Props) => {
  return (
    <div>
      {Object.entries(openMic).map(([key, val]) => (
        <p key={key}>
          {key} - {val}
        </p>
      ))}
    </div>
  );
};
