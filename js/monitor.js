import assert from 'assert'
import $ from 'jquery'

require('../less/monitor.less')

const config = require('../config')
const AWS = window.AWS

AWS.config.region = 'us-east-1'
AWS.config.update(config.aws)

let ec2 = new AWS.EC2()

let describeInstances = function () {
  console.log('Describing instances...')

  let wrapper = $('.instances')

  ec2.describeInstances({
    Filters: [{
      Name: 'key-name',
      Values: ['4yopping-general']
    }, {
      Name: 'instance.group-name',
      Values: [config.storeId]
    }]
  }, function (err, res) {
    if (err) return console.error(err)
    assert(res.Reservations.length, `Not found instances with ${config.storeId} security group`)

    let instances = res.Reservations[0].Instances

    instances.forEach((instance) => {
      let instanceElement = $(`#${instance.InstanceId}`)

      $.ajax({
        url: `http://${instance.PublicIpAddress}/`,
        complete: function (xhr) {
          if (instanceElement.length) {
            instanceElement.find('.instance-address').html(instance.PublicIpAddress)
            instanceElement.find('.instance-state').html(instance.State.Name)
            instanceElement.find('.instance-status').html(xhr.status)
          } else {
            instanceElement = $(`
              <div id="${instance.InstanceId}" class="instance">
                <div>
                  <strong>Address</strong>:
                  <span class="instance-address">${instance.PublicIpAddress}</span>
                </div>
                <div>
                  <strong>State</strong>:
                  <span class="instance-state">${instance.State.Name}</span>
                </div>
                <div>
                  <strong>Status Code</strong>:
                  <span class="instance-status">${xhr.status}</span>
                </div>
              </div>
            `)

            wrapper.append(instanceElement)
          }

          if (/^2/.test(xhr.status)) {
            instanceElement.removeClass('out-of-service').addClass('in-service')
          } else {
            instanceElement.removeClass('in-service').addClass('out-of-service')
          }
        }
      })
    })

    console.log(instances)
  })
}

let testLoadBalancer = function () {
  let elbElement = $('.elb')
  elbElement.find('.address').html(config.elb)

  $.ajax({
    url: config.elb,
    complete: function (xhr) {
      if (/^2/.test(xhr.status)) {
        elbElement.removeClass('out-of-service').addClass('in-service')
      } else {
        elbElement.removeClass('in-service').addClass('out-of-service')
      }
    }
  })
}

setInterval(testLoadBalancer, 1000)
setInterval(describeInstances, 1000)

$('.elb').find('.store-id').html(config.storeId)
