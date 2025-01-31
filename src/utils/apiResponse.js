class ApiResponse {
  constructor(statusCode, message = "Success", data = {}) {
    if (typeof statusCode !== "number") {
      throw new Error("statusCode must be a number");
    }
    if (statusCode < 100 || statusCode > 599) {
      throw new Error("statusCode must be a valid HTTP status code");
    }

    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
  }
}

export default ApiResponse;
