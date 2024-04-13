import { Venue } from "@/types";

interface Props {
  venue: Venue;
}

const VenueForm = ({ venue }: Props) => {
  return (
    <div>
      {Object.keys(venue).map((key) => (
        <p key={key}>{key} - {venue[key]}</p>
      ))}
    </div>
  );
};

export default VenueForm;