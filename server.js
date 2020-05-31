import sample from 'lodash/sample'
import { setQueues, UI } from 'bull-board'
import express from 'express'
import bodyParser from 'body-parser'
import db from './db'


import queue, { WORKER_A, WORKER_B, WORKER_C } from './index'

setQueues([queue])
const shortid = require('shortid')
const app = express()
const port = 3000
app.use(bodyParser.json())
app.post('/workers', async (req, res) => {
  const id = shortid.generate()
  const worker = sample([WORKER_A, WORKER_B, WORKER_C])
  const jobData = {
    id,
    worker: worker,
  }
  const jobOpt = {
    jobId: worker,
  }
  const job = await queue.getJobFromId(worker)
  // const jobState =
  if (job) {
    const jobState = await job.getState()
    if (!['active', 'waiting', 'delayed'].includes(jobState)) {
      queue.add(`Auto withdraw`, jobData, jobOpt)
    } else {
      // sample datastore for save not available queue
      db.insert({ worker, data: jobData, option: jobOpt, createdAt: new Date().getTime() })
    }
  } else {
    queue.add(`Auto withdraw`, jobData, jobOpt)
  }
  res.send(`job was added with id ${id}`)
})
app.use('/admin/queues', UI)

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
