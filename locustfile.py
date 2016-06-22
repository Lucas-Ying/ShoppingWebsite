from locust import HttpLocust, TaskSet, task

class MyTaskSet(TaskSet):
    @task(1)
    def index(self):
        self.client.get("/")

    @task(2)
    def products(self):
        self.client.get("/get_product")
        self.client.put("/add_product", {"name":"sock", "cost":"89", "description":"a single sock"})
        self.client.post("/update_product", {"id":"242", "name":"sock", "cost":"99999", "description":"the 2nd socks"})
        self.client.delete("/delete_product?id=243")


    @task(3)
    def users(self):
        self.client.get("/get_users")
        self.client.put("/get_user", {"email":"jimmy2174@gmail.com", "pass":"89"})
        self.client.put("/add_user", {"email":"responseTime@resp", "pass":"8999999", "name":"new test", "cart":"1"})
        self.client.delete("/delete_user?id=106&pass=aaaaaa&name=james")


    @task(4)
    def cart(self):
        self.client.get("/get_cart")
        self.client.put("/get_userCart", {"email":"jimmy2174@gmail.com", "userID":"89"})
        self.client.put("/addCart", {"id":"1003", "userID":"103", "balance":"100","items":" "})
        self.client.post("/update_cart", {"id":"54", "userID":"103", "balance":"99","items":"stuff"})
        self.client.delete("/delete_cart?id=54")


    @task(5)
    def purchases(self):
        self.client.get("/get_purchases")
        self.client.put("/get_purchases", {"cartid":"53", "name":"scarf", "quantity":"2", "price":"9", "description":"much warm"})
        self.client.post("/update_purchase", {"cartid":"53", "name":"many gloves", "quantity":"99","price":"50"})
        self.client.delete("/delete_cart?name=manygloves&cartid=53")



    @task(6)
    def deletePurchaseFromCart(self):
        self.client.delete("/checkout?cartid=53")

    @task(7)
    def getCollection(self):
        self.client.get("/collection/*")


    @task(8)
    def getHelp(self):
        self.client.get("/help")
        self.client.get("/kart")
        self.client.get("/kids1")
        self.client.get("/login")
        self.client.get("/men")
        self.client.get("/register")
        self.client.get("/women1")



class WebsiteUser(HttpLocust):
    task_set = MyTaskSet
    min_wait=5000
    max_wait=9000

    # @task(1)
    # def profile(self):
    #     self.client.get("/profile")


    # @task(2)
    # def index(self):
    #     self.client.get("/")

    # @task(1)
    # def about(self):
    #     self.client.get("/about/")

