import { Event } from "@/types";

import { useSchema } from "@/hooks/schema";

import validator from '@rjsf/validator-ajv8';
import { Form } from '@rjsf/mui';
import { WidgetProps } from "@rjsf/utils";
import VenueSelect from "./VenueSelect";

interface Props {
  event: Event;
}

const EventForm = ({ event }: Props) => {

  const { eventSchema } = useSchema();

  const log = (type: any) => console.log.bind(console, type);

  const uiSchema: object = {
    "description": {
      "ui:widget": "textarea"
    },
    "start_time": {
      "ui:widget": "time"
    },
    "end_time": {
      "ui:widget": "time"
    },
    "doors_open": {
      "ui:widget": "time"
    },
    "signup_start_time": {
      "ui:widget": "time"
    },
    "venue": {
      "ui:widget": (props: WidgetProps) => {
        return (
          <VenueSelect venueId={props.value} onChange={(event) => props.onChange(event.target.value)} />
        );
      }
    }
  }

  return (
    <Form
      schema={eventSchema}
      uiSchema={uiSchema}
      formData={event}
      validator={validator}
      onChange={log('changed')}
      onSubmit={log('submitted')}
      onError={log('errors')}
    />
  );
};

export default EventForm;