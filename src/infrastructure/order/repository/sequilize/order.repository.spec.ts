import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  const customerCreatedRepository = async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("1", "Customer One");
    const address = new Address("Street One", 101, "14021000", "City One");
    customer.changeAddress(address);
    await customerRepository.create(customer);
    return customer;
  };

  it("should create a new order", async () => {
    const customer = await customerCreatedRepository();

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product One", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", customer.id, [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: customer.id,
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: order.id,
          product_id: product.id,
        },
      ],
    });
  });

  it("should update a order", async () => {
    const customer = await customerCreatedRepository();

    const productRepository = new ProductRepository();
    const productOne = new Product("123", "Product One", 10);
    await productRepository.create(productOne);

    const orderItemOne = new OrderItem(
      "1",
      productOne.name,
      productOne.price,
      productOne.id,
      2
    );

    const order = new Order("12", customer.id, [orderItemOne]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: customer.id,
      total: order.total(),
      items: [
        {
          id: orderItemOne.id,
          name: orderItemOne.name,
          price: orderItemOne.price,
          quantity: orderItemOne.quantity,
          order_id: order.id,
          product_id: productOne.id,
        },
      ],
    });

    const productTwo = new Product("146", "Product Two", 20);
    await productRepository.create(productTwo);

    const orderItemTwo = new OrderItem(
      "2",
      productTwo.name,
      productTwo.price,
      productTwo.id,
      3
    );

    order.changeItems([orderItemOne, orderItemTwo]);

    await orderRepository.update(order);

    const orderModelTwo = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModelTwo.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: customer.id,
      total: order.total(),
      items: [
        {
          id: orderItemOne.id,
          name: orderItemOne.name,
          price: orderItemOne.price,
          quantity: orderItemOne.quantity,
          order_id: order.id,
          product_id: productOne.id,
        },
        {
          id: orderItemTwo.id,
          name: orderItemTwo.name,
          price: orderItemTwo.price,
          quantity: orderItemTwo.quantity,
          order_id: order.id,
          product_id: productTwo.id,
        },
      ],
    });
  });

  it("should find a order", async () => {
    const customer = await customerCreatedRepository();

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product One", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("12", customer.id, [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    const foundOrder = await orderRepository.find(order.id);

    expect(orderModel.toJSON()).toStrictEqual({
      id: foundOrder.id,
      customer_id: foundOrder.customerId,
      total: foundOrder.total(),
      items: foundOrder.items.map((item) => ({
        id: item.id,
        name: item.name,
        order_id: foundOrder.id,
        price: item.price,
        product_id: item.productId,
        quantity: item.quantity,
      })),
    });
  });

  it("should throw an error when order is not found", async () => {
    const orderRepository = new OrderRepository();

    expect(async () => {
      await orderRepository.find("ABC");
    }).rejects.toThrow("Order not found");
  });

  it("should all orders", async () => {
    const customer = await customerCreatedRepository();

    const productRepository = new ProductRepository();
    const productOne = new Product("123", "Product One", 10);
    const productTwo = new Product("246", "Product Two", 20);

    await productRepository.create(productOne);
    await productRepository.create(productTwo);

    const orderItemOne = new OrderItem(
      "1",
      productOne.name,
      productOne.price,
      productOne.id,
      2
    );
    const orderItemTwo = new OrderItem(
      "2",
      productTwo.name,
      productTwo.price,
      productTwo.id,
      3
    );

    const orderOne = new Order("12", customer.id, [orderItemOne]);
    const orderTwo = new Order("24", customer.id, [orderItemTwo]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(orderOne);
    await orderRepository.create(orderTwo);

    const foundOrders = await orderRepository.findAll();

    expect(foundOrders).toHaveLength(2);
    expect(foundOrders).toContainEqual(orderOne);
    expect(foundOrders).toContainEqual(orderTwo);
  });
});
