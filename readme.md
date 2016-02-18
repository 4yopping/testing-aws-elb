# Testing AWS ELB

## Usage

Create a new store with Qomanda:

```
$ qomanda create store --store-name="Agú Agú"
```

Wait until the load balancer is working, to know that just list stores:

```
$ qomanda list store
```

Then, configure a new `config.js` file from `config.sample.js`. Finally, start monitor:

```
$ npm start
```

## Stress test using Apache Benchmark

Configure your CloudWatch alarms and autoscaling policies if you want to test elastic instances. Using Apache Benchmark, run:

```
$ ab -v 2 -n 100000 -c 100 http://[ELB_ADDRESS]/
```



