<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAdd">创建定时任务</el-button>

    <el-table v-loading="listLoading" border :data="taskList" style="width: 100%;margin-top:30px;" @sort-change="sortChange">
      <el-table-column align="center" label="id" prop="id" sortable width="60">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="任务名称" prop="name" sortable width="220">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="cron表达式" prop="cron" sortable width="220">
        <template slot-scope="scope">
          {{ scope.row.cron }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" prop="description" sortable label="描述">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否启动" width="80">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.open === true" type="success">是</el-tag>
          <el-tag v-else type="info">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="280">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button v-if="scope.row.open !== true" type="success" size="small" @click="handleStart(scope)">开始</el-button>
          <el-button v-if="scope.row.open === true" type="info" size="small" @click="handleStop(scope)">停止</el-button>
          <el-button type="warning" size="small" @click="handleRun(scope)">执行</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getTaskPage" />

    <el-dialog v-loading="dialogLoading" :visible.sync="dialogVisible" :destroy-on-close="true" :title="dialogType==='new'?'创建定时任务':'编辑定时任务'">
      <el-form ref="taskForm" :model="task" label-width="95px" label-position="right" :rules="rules">
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务名称" prop="name">
              <el-input v-model="task.name" placeholder="任务名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="cron表达式" prop="cron">
              <el-input v-model="task.cron" placeholder="cron表达式" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="Bean名称" prop="beanName">
              <el-select v-model="task.beanName" filterable placeholder="请选择Bean" @change="changeBean">
                <el-option v-for="item in beanOptions" :key="item.beanName" :label="item.beanName" :value="item.beanName">
                  <el-tooltip class="item" :content="item.className" placement="right">
                    <span>{{ item.beanName | simplifyBeanName }}</span>
                  </el-tooltip>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="方法名" prop="methodInfo">
              <el-select v-model="task.methodInfo" filterable placeholder="请选择方法名" @change="changeMethod">
                <el-option v-for="(item, index) in methodOptions" :key="index" :label="item.methodSimpleName" :value="JSON.stringify(item)">
                  <el-tooltip class="item" :content="item.methodFullName" placement="right">
                    <span>{{ item.methodSimpleName }}</span>
                  </el-tooltip>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="methodParams.length > 0" label="参数（请以JSON的方式输入）">
          <div v-for="(item,index) in methodParams" :key="index">
            <el-input v-model="item.paramValue" placeholder="输入参数值" class="input-with-select">
              <span slot="prepend" class="param-type">{{ item.paramType }}</span>
            </el-input>
          </div>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否开启">
              <el-radio-group v-model="task.open">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述">
          <el-input
            v-model="task.description"
            :autosize="{ minRows: 4, maxRows: 10 }"
            type="textarea"
            placeholder="定时任务描述"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button v-loading="loading" type="primary" @click="dialogType==='new'?createData():updateData()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { getTaskPage, getTaskById, addTask, updateTask, deleteTask, runTask, startTask, stopTask } from '@/api/task'
import { getBeanList, getBeanInfoByName } from '@/api/bean'

const defaultTask = {
  id: '',
  name: '',
  cron: '',
  beanName: '',
  methodInfo: '',
  paramInfo: '',
  open: false,
  description: ''
}

export default {
  name: 'Task',
  components: {
    Pagination
  },
  filters: {
    simplifyBeanName(value) {
      if (value) {
        const splits = value.split('.')
        return splits[splits.length - 1]
      }
      return value
    }
  },
  data() {
    return {
      total: 0,
      listLoading: true,
      listQuery: {
        current: 1,
        size: 20,
        keyword: '',
        orders: []
      },
      loading: false,
      beanOptions: [],
      methodOptions: [],
      selectBeanInfo: null,
      methodParams: [],
      task: Object.assign({}, defaultTask),
      taskList: [],
      dialogVisible: false,
      dialogLoading: false,
      dialogType: 'new',
      rules: {
        name: [
          { required: true, message: '请输入定时任务名称', trigger: 'blur' }
        ],
        cron: [
          { required: true, message: '请输入Cron表达式', trigger: 'blur' }
        ],
        beanName: [
          { required: true, message: '请输入bean名称', trigger: 'blur' }
        ],
        methodInfo: [
          { required: true, message: '请输入方法名', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getTaskPage()
  },
  methods: {
    async getTaskPage() {
      this.listLoading = true
      const { data } = await getTaskPage(this.listQuery).catch(() => {
        this.listLoading = false
      })
      this.taskList = data.records
      this.total = data.total
      this.listLoading = false
    },
    sortChange(data) {
      const { prop, order } = data
      if (!order) {
        this.listQuery.orders = []
      } else if (order === 'ascending') {
        this.listQuery.orders = [{
          column: prop,
          asc: true
        }]
      } else {
        this.listQuery.sort = [{
          column: prop,
          asc: false
        }]
      }
      this.getTaskPage()
    },
    toMethodSimpleName(value) {
      let methodName = value.methodName
      const { paramTypes } = value
      methodName += '('
      if (paramTypes && paramTypes.length > 0) {
        paramTypes.forEach((item, index) => {
          const splits = item.split('.')
          methodName += splits[splits.length - 1]
          if (index < paramTypes.length - 1) {
            methodName += ', '
          }
        })
      }
      return methodName + ')'
    },
    toMethodFullName(value) {
      let methodName = value.methodName
      const { paramTypes } = value
      methodName += '('
      if (paramTypes && paramTypes.length > 0) {
        paramTypes.forEach((item, index) => {
          methodName += item
          if (index < paramTypes.length - 1) {
            methodName += ', '
          }
        })
      }
      return methodName + ')'
    },
    getMethodOptions(value) {
      getBeanInfoByName(value).then(res => {
        this.selectBeanInfo = res.data
        this.methodOptions = res.data.methods.map(item => {
          return {
            methodName: item.methodName,
            methodSimpleName: this.toMethodSimpleName(item),
            methodFullName: this.toMethodFullName(item),
            paramTypes: item.paramTypes
          }
        })
      })
    },
    changeBean(value) {
      this.methodParams = []
      if (this.dialogVisible) {
        this.task.methodName = ''
      }
      if (value) {
        this.getMethodOptions(value)
      } else {
        this.selectBeanInfo = null
        this.methodOptions = []
      }
    },
    changeMethod(value) {
      if (value) {
        const method = JSON.parse(value)
        if (method) {
          const { paramTypes } = method
          this.methodParams = []
          if (paramTypes && paramTypes.length > 0) {
            for (let i = 0; i < paramTypes.length; i++) {
              this.methodParams.push({
                paramType: paramTypes[i],
                paramValue: ''
              })
            }
          }
        }
      }
    },
    async handleAdd() {
      this.task = {}
      this.loading = false
      this.dialogType = 'new'
      this.task = Object.assign({}, defaultTask)
      await getBeanList().then(res => {
        this.beanOptions = res.data
      })
      this.dialogVisible = true
      this.dialogLoading = false
    },
    async handleEdit(scope) {
      this.task = {}
      this.loading = false
      this.dialogType = 'edit'
      await getTaskById(scope.row.id).then(async res => {
        this.task = res.data
      })
      await getBeanList().then(res => {
        this.beanOptions = res.data
      })
      this.getMethodOptions(this.task.beanName)
      this.methodParams = JSON.parse(this.task.paramInfo || '[]')
      // this.changeBean(this.task.beanName)
      // this.changeMethod(this.task.methodName)
      this.dialogVisible = true
      this.dialogLoading = false
    },
    createData() {
      this.$refs.taskForm.validate(async valid => {
        if (valid) {
          this.loading = true
          this.task.paramInfo = JSON.stringify(this.methodParams)
          await addTask(this.task).then(res => {
            const { name, description } = this.task
            this.dialogVisible = false
            this.$notify({
              title: '添加成功',
              dangerouslyUseHTMLString: true,
              message: `
                <div>名称: ${name}</div>
                <div>描述: ${description}</div>
              `,
              type: 'success'
            })
            this.loading = false
            this.getTaskPage()
          }).catch(() => {
            this.loading = false
          })
        }
      })
    },
    updateData() {
      this.$refs.taskForm.validate(async valid => {
        if (valid) {
          this.loading = true
          this.task.paramInfo = JSON.stringify(this.methodParams)
          await updateTask(this.task).then(res => {
            const { name, description } = this.task
            this.dialogVisible = false
            this.$notify({
              title: '修改成功',
              dangerouslyUseHTMLString: true,
              message: `
                <div>名称: ${name}</div>
                <div>描述: ${description}</div>
              `,
              type: 'success'
            })
            this.loading = false
            this.getTaskPage()
          }).catch(() => {
            this.loading = false
          })
        }
      })
    },
    async handleDelete({ row }) {
      this.$confirm('确定删除这个定时任务?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await deleteTask(row.id)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getTaskPage()
      }).catch(() => {
        this.$message({
          type: 'warning',
          message: '操作已取消!'
        })
      })
    },
    async handleRun({ row }) {
      this.$confirm('确定运行这个运行任务?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await runTask(row.id).then(res => {
          this.$message({
            type: 'success',
            message: `运行成功!（返回信息：${res.data}）`
          })
          this.getTaskPage()
        })
      }).catch(() => {
        this.$message({
          type: 'warning',
          message: '操作已取消!'
        })
      })
    },
    async handleStart({ row }) {
      this.$confirm('确定开启这个定时任务?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await startTask(row.id).then(() => {
          this.$message({
            type: 'success',
            message: '启动成功!'
          })
          this.getTaskPage()
        })
      }).catch(() => {
        this.$message({
          type: 'warning',
          message: '操作已取消!'
        })
      })
    },
    async handleStop({ row }) {
      this.$confirm('确定停止这个定时任务?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await stopTask(row.id).then(res => {
          this.$message({
            type: 'success',
            message: '停止成功!'
          })
          this.getTaskPage()
        })
      }).catch(() => {
        this.$message({
          type: 'warning',
          message: '操作已取消!'
        })
      })
    }
  }
}
</script>

<style lang="scss">
.app-container {
  .tasks-table {
    margin-top: 30px;
  }

  .input-with-select {
    margin-bottom: 15px;

    .el-select .el-input .param-type {
      width: 130px;
    }

  }

}
</style>
