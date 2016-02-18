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

    let instances = []
    res.Reservations.forEach((r) => {
      instances = instances.concat(r.Instances)
    })

    let instances_ids = $('.instance').toArray()
    if (instances_ids.length) {
      let currentInstances = instances.map((i) => i.InstanceId)
      instances_ids.forEach((i) => {
        let id = $(i).attr('id')
        if (currentInstances.indexOf(id) < 0) {
          $(i).remove()
        }
      })
    }

    instances.forEach((instance) => {
      let instanceElement = $(`#${instance.InstanceId}`)

      if (instanceElement.length) {
        instanceElement.find('.instance-address').html(instance.PublicIpAddress)
        instanceElement.find('.instance-state').html(instance.State.Name)
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
              <span class="instance-status">0</span>
            </div>
          </div>
        `)

        wrapper.append(instanceElement)
      }

      $.ajax({
        url: `http://${instance.PublicIpAddress}/`,
        timeout: 5000,
        complete: function (xhr) {
          instanceElement.find('.instance-status').html(xhr.status)

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
    timeout: 5000,
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
