import EventDispatcher from "../../@shared/event/event-dispatcher";
import CustomerCreatedEvent from "./customer-created.event";
import PrintFirstWhenCustomerIsCreatedHandler from "./handler/print-first-when-customer-is-created.handler";
import PrintSecondWhenCustomerIsCreatedHandler from "./handler/print-second-when-customer-is-created.handler";

describe("Domain customer created event tests", () => {
  it("should notify all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandlerFirst = new PrintFirstWhenCustomerIsCreatedHandler();
    const eventHandlerSecond = new PrintSecondWhenCustomerIsCreatedHandler();
    const spyEventHandlerFirst = jest.spyOn(eventHandlerFirst, "handle");
    const spyEventHandlerSecond = jest.spyOn(eventHandlerSecond, "handle");

    eventDispatcher.register("CustomerCreatedEvent", eventHandlerFirst);
    eventDispatcher.register("CustomerCreatedEvent", eventHandlerSecond);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(eventHandlerFirst);
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]
    ).toMatchObject(eventHandlerSecond);

    const customerCreatedEvent = new CustomerCreatedEvent({
      name: "Customer One",
    });

    eventDispatcher.notify(customerCreatedEvent);

    expect(spyEventHandlerFirst).toHaveBeenCalled();
    expect(spyEventHandlerSecond).toHaveBeenCalled();
  });
});
