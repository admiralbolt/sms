import { Venue } from "@/types";

interface Props {
  venue: Venue;
}

export const VenueForm = ({ venue }: Props) => {
  return (
    <div>
      {Object.entries(venue).map(([key, value]) => (
        <p key={key}>
          {key} - {value}
        </p>
      ))}
    </div>
  );
};
