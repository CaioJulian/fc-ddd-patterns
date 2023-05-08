import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerUpdatedEvent from "../customer-updated.event";

export default class PrintWhenAddressIsChangedHandler
  implements EventHandlerInterface<CustomerUpdatedEvent>
{
  handle(event: CustomerUpdatedEvent): void {
    const { eventData } = event;
    console.log(
      `Address of the customer: ${eventData.id}, ${eventData.name}, changed for: `,
      eventData.address
    );
  }
}
