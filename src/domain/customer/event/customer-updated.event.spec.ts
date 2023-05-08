import EventDispatcher from "../../@shared/event/event-dispatcher";
import CustomerUpdatedEvent from "./customer-updated.event";
import PrintWhenAddressIsChangedHandler from "./handler/print-when-address-is-changed.handler";

describe("Domain customer updated event tests", () => {
  it("should notify all event handlers", async () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new PrintWhenAddressIsChangedHandler();
    const spyEventHandler = jest.spyOn(eventHandler, "handle");

    eventDispatcher.register("CustomerUpdatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["CustomerUpdatedEvent"][0]
    ).toMatchObject(eventHandler);

    const customerUpdatedEvent = new CustomerUpdatedEvent({
      id: "1",
      name: "Customer One",
      address: {
        street: "Street One",
        number: 101,
        zip: "14021000",
        city: "City One",
      },
    });

    eventDispatcher.notify(customerUpdatedEvent);

    expect(spyEventHandler).toHaveBeenCalled();
  });
});
