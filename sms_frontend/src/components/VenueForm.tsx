import { useSchema } from "@/hooks/schema";
import { Venue } from "@/types";
import validator from "@rjsf/validator-ajv8";
import { Form } from "@rjsf/mui";


interface Props {
  venue: Venue;
}

const VenueForm = ({ venue }: Props) => {
  const { venueSchema } = useSchema();

  const log = (type: any) => console.log.bind(console, type);

  return (
    <Form
      schema={venueSchema}
      formData={venue}
      validator={validator}
      onChange={log('changed')}
      onSubmit={log('submitted')}
      onError={log('errors')}
    />
  );
};

export default VenueForm;