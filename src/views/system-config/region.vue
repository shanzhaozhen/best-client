<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" type="primary" @click="handleAdd">创建区域信息</el-button>
      <div class="filter-item" style="float: right">
        <el-input v-model="listQuery.keyword" class="filter-item" placeholder="请输入关键字" style="width: 200px;" @keyup.enter.native="getRegionPage" />
        <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-search" @click="getRegionPage">查询</el-button>
      </div>
    </div>
    <el-table v-loading="listLoading" border :data="regionList" style="width: 100%;" @sort-change="sortChange">
      <el-table-column align="center" label="id" prop="id" sortable width="120" />
      <el-table-column align="center" label="区域名称" prop="name" sortable width="260" />
      <el-table-column align="center" label="区域编号" prop="code" sortable />
      <el-table-column align="center" label="层级" prop="level" sortable width="180" />
      <el-table-column align="center" label="操作" width="150">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getRegionPage" />

    <el-dialog :visible.sync="dialogVisible" :destroy-on-close="true" :title="dialogType==='new'?'创建区域信息':'编辑区域信息'">
      <el-form ref="regionForm" v-loading="formLoading" :model="region" label-width="80px" label-position="left" :rules="rules">
        <el-form-item label="区域名称" prop="name">
          <el-input v-model="region.name" placeholder="区域名称" />
        </el-form-item>
        <el-form-item label="区域编码" prop="code">
          <el-input v-model="region.code" placeholder="区域编码" />
        </el-form-item>
        <el-form-item label="父级区域" prop="pid">
          <el-select v-model.number="region.pid" filterable clearable placeholder="父级区域" @change="pidChange">
            <el-option v-for="item in regionOptions" :key="item.id" :label="item.name" :value="item.id">
              <span style="float: left;">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.code }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="层级" prop="level">
          <el-input v-model.number="region.level" disabled placeholder="层级" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button v-loading="confirmLoading" type="primary" @click="dialogType==='new'?createRegion():updateRegion()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import { getRegionPage, getAllRegionList, getRegionById, addRegion, updateRegion, deleteRegion } from '@/api/region'
import Pagination from '@/components/Pagination'

const defaultRegion = {
  id: '',
  name: '',
  code: '',
  pid: null,
  level: 1
}

export default {
  name: 'Region',
  components: { Pagination },
  directives: { waves },
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
      confirmLoading: false,
      region: Object.assign({}, defaultRegion),
      regionList: [],
      regionOptions: [],
      dialogVisible: false,
      formLoading: false,
      dialogType: 'new',
      checkStrictly: true,
      routeTreeProps: {
        children: 'children',
        label: 'title'
      },
      resourceTreeProps: {
        children: 'children',
        label: 'name'
      },
      rules: {
        name: [
          { required: true, message: '请输入区域名称', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入区域编码', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getRegionPage()
  },
  methods: {
    async getRegionPage() {
      this.listLoading = true
      const res = await getRegionPage(this.listQuery).catch(() => {
        this.listLoading = false
      })
      this.regionList = res.data.records
      this.total = res.data.total
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
      this.getRegionPage()
    },
    async getRegionOptions() {
      const res = await getAllRegionList()
      this.regionOptions = res.data
    },
    pidChange(value) {
      if (value) {
        this.regionOptions.forEach(item => {
          if (item.id === value) {
            this.region.level = item.level + 1
          }
        })
      } else {
        this.region.level = 1
      }
    },
    async handleAdd() {
      this.region = Object.assign({}, defaultRegion)
      this.getRegionOptions()
      this.dialogType = 'new'
      this.confirmLoading = false
      this.dialogVisible = true
    },
    async handleEdit(scope) {
      this.dialogType = 'edit'
      this.confirmLoading = false
      this.formLoading = true
      this.getRegionOptions()
      const res = await getRegionById(scope.row.id)
      this.region = res.data
      this.formLoading = false
      this.dialogVisible = true
    },
    createRegion() {
      this.$refs.regionForm.validate(async valid => {
        if (valid) {
          this.confirmLoading = true

          await addRegion(this.region).then(() => {
            const { name, code } = this.region
            this.$notify({
              title: '添加成功',
              dangerouslyUseHTMLString: true,
              message: `
                <div>区域名称: ${name}</div>
                <div>区域编号：${code}</div>
              `,
              type: 'success'
            })
            this.dialogVisible = false
            this.confirmLoading = false
            this.getRegionPage()
          }).catch(() => {
            this.confirmLoading = false
          })
        }
      })
    },
    updateRegion() {
      this.$refs.regionForm.validate(async valid => {
        if (valid) {
          this.confirmLoading = true

          await updateRegion(this.region).then(() => {
            const { name, code } = this.region
            this.$notify({
              title: '修改成功',
              dangerouslyUseHTMLString: true,
              message: `
                <div>区域名称: ${name}</div>
                <div>区域编号：${code}</div>
              `,
              type: 'success'
            })
            this.dialogVisible = false
            this.confirmLoading = false
            this.getRegionPage()
          }).catch(() => {
            this.confirmLoading = false
          })
        }
      })
    },
    async handleDelete({ row }) {
      console.log(row)
      this.$confirm('确定删除这个资源?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await deleteRegion(row.id)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getRegionPage()
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

<style lang="scss" scoped>
.app-container {
  .regions-table {
    margin-top: 30px;
  }
}
</style>
