# External Promotions Example

This app is an example to merchants on how to implment their own external promotions customization backend apps. It should expose an API that will recceive the context that is needed to calculate the external promotions on 3rd-party providers, transform this data to the expected contract defined by VTEX and call the VTEX's internal app responsible for applying the external promotions.

Here is what we expect to be the context on each supported scenario:

| Scenario | Context                                                                                                                                                                                                                                                        |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PDP      | The details of the item in display, such as the sku id, original seling price, etc, alongside with the shopper's session.                                                                                                                                      |
| PLP      | The details of items in the search result, similarly to the PDP scenario, but for multiple independent items, alongside with the shopper's session. Please beware that this is not a shopping cart with multiple items, but a collection of independent items. |
| Checkout | WIP                                                                                                                                                                                                                                                            |

## API

Here we'll give an overview of how this API should be implemented by the merchants.

### Calculate External Promotions endpoint

This is a public method that will be called by the storefront customizations and it's responsible for making a request to the 3rd-party external provider and send this data to the VTEX platform, respecting the defined protocol. This app is agnostic from the store's implementation, meaning that we don't see a reason why it shouldn't work in all current store frameworks supported by VTEX (Portal, SF, and FastStore). However, from a product perspective, we'll foment the usage of our latest technologies and suggest using FastStore for your store's implementation.

**Overview**

| Property             | Value                            |
| -------------------- | -------------------------------- |
| Method               | `POST`                           |
| URL                  | `/promotions/external/calculate` |
| Auth required        | No                               |
| Permissions required | None                             |
| Request body         | `application/json`               |
| Response             | `application/json`               |

**Request body**
| Property | Type | Required | Desription |
|---------------------- |------------------------- | ---------- | ---------- |
| items | Item[] | yes | An array of product items that will be used for calculating the external promotions. |

**Item**
| Property | Type | Required | Desription |
|---------------------- |------------------------- | ---------- | ---------- |
| id | string | yes | The unique identifier for the item, aka SKU ID. |
| sellingPrice | number | yes | The original selling price of the item. By original we mean that we expect this to be the selling price of the item before any discounts are applied |

**Request body example**

Provide name of Account to be created.

```json
{
  "items": [
    {
      "id": "1",
      "sellingPrice": 100
    }
  ]
}
```

**VTEX External Promotions data contract**

| Property     | Type           | Required              | Desription                                                                                                                                                                                      |
| ------------ | -------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| version      | "v1"           | yes                   | The version of the data contract.                                                                                                                                                               |
| type         | "page", "cart" | yes                   | The type of the data contract. <br> "page" means that the data being sent is valid for page contexts (PDP/PLP). <br> "cart" means that the data being sent is valid to art contexts (Checkout). |
| exp          | number         | no                    | The unix time (milliseconds) until the sent data becomes invalid.                                                                                                                               |
| cartHash     | string         | yes (for "cart" type) | A hash key for the cart in which this promotions data is valid for. This will be used for matching the promotional data when navigating to chekout and when placing the order.                  |
| intendedUser | string         | yes                   | An unique identifier of the user whose the promotional data is valid to. This will be used for cheking if the promotions are being requested by the correct user.                               |
| promotions   | Promotion[]    | yes                   | An array of valid promotions that need to be applied for the specified context.                                                                                                                 |

**Promotion**
| Property | Type |Required | Desription |
|---------------------- | ------------------------- |-------- | ---------- |
| identifier | string | yes | An identifier for the promotion. |
| effect | Effect | yes | The discount definition that will be applied. |
| scope | Scope[] | yes | The definition of on which items the discount should be applied. |

**Effect**
| Property | Type |Required | Desription |
|---------------------- |------------------------- |-------- | ---------- |
| type | "nominal" | |The type of discount that is being given. |
| settings | Settings | |The type of discount that is being given. |

**Settings**
| Property | Type |Required | Desription |
|---------------------- |------------------------- |-------- | ---------- |
| value | number | yes|The amount/value of the discount |
| applyMode | "OnEachItem", "SharedAmongItems" | yes|How the discount will be appliend on the items described in the scope. <br> "OnEachItem" means that the whole amount will be applied to all matching items. <br> "SharedAmongItems" means that the amount will be split and shared evenly among the matching items. |

**Scope**
| Property | Type | Required | Desription |
|---------------------- |------------------------- | -------- | ---------- |
| skuId | string | yes |The unique identifier of the item on which the disount should be applied. |
| quantity | number | yes | The quantity of same items on which the discount should be applied. |

For more information see the External Promotion Fields Explanation on this [RFC](https://docs.google.com/document/d/1BPkfRz3t2BENqZaVMwToDALK5ePRoDWAlHoyD2qM5WU/edit#heading=h.1kydlntegy7j).

**Response example**

```json
{
  "version": "v1",
  "type": "page",
  "exp": 1680812032408,
  "cartHash": "cart_hash",
  "intendedUser": "intended_user",
  "promotions": [
    {
      "identifier": "mocked-external-promotion",
      "effect": {
        "type": "nominal",
        "settings": {
          "value": 90,
          "applyMode": "OnEachItem"
        }
      },
      "scope": [
        {
          "skuId": "1",
          "quantity": 1
        }
      ]
    }
  ]
}
```
