<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" type="primary" @click="handleAdd">创建角色</el-button>
      <div class="filter-item" style="float: right">
        <el-input v-model="listQuery.keyword" class="filter-item" placeholder="请输入关键字" style="width: 200px;" @keyup.enter.native="getRolePage" />
        <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-search" @click="getRolePage">查询</el-button>
      </div>
    </div>
    <el-table v-loading="listLoading" border :data="roleList" style="width: 100%;" @sort-change="sortChange">
      <el-table-column align="center" label="id" prop="id" sortable width="60" />
      <el-table-column align="center" label="名称" prop="name" sortable width="220" />
      <el-table-column align="center" label="标识名称" prop="identification" sortable width="220" />
      <el-table-column align="header-center" prop="description" sortable label="描述" />
      <el-table-column align="center" label="操作" width="150">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getRolePage" />

    <el-dialog :visible.sync="dialogVisible" :destroy-on-close="true" :title="dialogType==='new'?'创建角色':'编辑角色'">
      <el-form ref="roleForm" v-loading="formLoading" :model="role" label-width="80px" label-position="left" :rules="rules">
        <el-form-item label="名称" prop="name">
          <el-input v-model="role.name" placeholder="角色名称" />
        </el-form-item>
        <el-form-item label="标识名称" prop="identification">
          <el-input v-model="role.identification" placeholder="标识名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="role.description"
            :autosize="{ minRows: 4, maxRows: 10 }"
            type="textarea"
            placeholder="角色描述"
          />
        </el-form-item>
        <el-form-item label="路由分配">
          <el-tree
            ref="routeTree"
            class="route-tree"
            node-key="id"
            show-checkbox
            :check-strictly="checkStrictly"
            :data="routeTree"
            :props="routeTreeProps"
          />
        </el-form-item>
        <el-form-item label="权限分配">
          <el-tree
            ref="resourceTree"
            class="resource-tree"
            node-key="id"
            show-checkbox
            :check-strictly="checkStrictly"
            :data="resourceTree"
            :props="resourceTreeProps"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button v-loading="confirmLoading" type="primary" @click="dialogType==='new'?createRole():updateRole()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination' // 分页模块
import { getRolePage, getRoleById, addRole, updateRole, deleteRole } from '@/api/role'
import { getAllRouteTree } from '@/api/route'
import { getAllResourceTree } from '@/api/resource'

const defaultRole = {
  id: '',
  name: '',
  identification: '',
  description: '',
  routeIds: [],
  resourceIds: []
}

export default {
  name: 'Role',
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
      role: Object.assign({}, defaultRole),
      routeTree: [],
      resourceTree: [],
      roleList: [],
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
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        identification: [
          { required: true, message: '请输入标识名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getRolePage()
  },
  methods: {
    async getRolePage() {
      this.listLoading = true
      const res = await getRolePage(this.listQuery).catch(() => {
        this.listLoading = false
      })
      this.roleList = res.data.records
      this.total = res.data.total
      this.listLoading = false
    },
    async getRouteTree() {
      const res = await getAllRouteTree()
      this.routeTree = res.data
    },
    async getResourceTree() {
      const res = await getAllResourceTree()
      this.resourceTree = res.data
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
      this.getRolePage()
    },
    async handleAdd() {
      this.role = Object.assign({}, defaultRole)
      await this.getRouteTree()
      await this.getResourceTree()
      if (this.$refs.routeTree) {
        this.$refs.routeTree.setCheckedNodes([])
      }
      if (this.$refs.resourceTree) {
        this.$refs.resourceTree.setCheckedNodes([])
      }
      this.dialogType = 'new'
      this.confirmLoading = false
      this.dialogVisible = true
    },
    async handleEdit(scope) {
      this.dialogType = 'edit'
      this.confirmLoading = false
      this.dialogVisible = true
      this.formLoading = true
      this.checkStrictly = true
      const res = await getRoleById(scope.row.id)
      await this.getRouteTree()
      await this.getResourceTree()
      this.role = res.data
      this.$nextTick(() => {
        this.$refs.routeTree.setCheckedKeys(this.role.routeIds || [])
        this.$refs.resourceTree.setCheckedKeys(this.role.resourceIds || [])
        this.checkStrictly = false
      })
      this.formLoading = false
    },
    createRole() {
      this.$refs.roleForm.validate(async valid => {
        if (valid) {
          this.confirmLoading = true

          this.role.routeIds = this.$refs.routeTree.getCheckedKeys()
          this.role.resourceIds = this.$refs.resourceTree.getCheckedKeys()

          await addRole(this.role).then(() => {
            const { name, identification, description } = this.role
            this.$notify({
              title: '添加成功',
              dangerouslyUseHTMLString: true,
              message: `
                <div>名称: ${name}</div>
                <div>标识名称：${identification}</div>
                <div>描述: ${description}</div>
              `,
              type: 'success'
            })
            this.dialogVisible = false
            this.confirmLoading = false
            this.getRolePage()
          }).catch(() => {
            this.confirmLoading = false
          })
        }
      })
    },
    updateRole() {
      this.$refs.roleForm.validate(async valid => {
        if (valid) {
          this.confirmLoading = true

          this.role.routeIds = this.$refs.routeTree.getCheckedKeys()
          this.role.resourceIds = this.$refs.resourceTree.getCheckedKeys()

          await updateRole(this.role).then(() => {
            const { name, identification, description } = this.role
            this.$notify({
              title: '修改成功',
              dangerouslyUseHTMLString: true,
              message: `
                <div>名称: ${name}</div>
                <div>标识名称：${identification}</div>
                <div>描述: ${description}</div>
              `,
              type: 'success'
            })
            this.dialogVisible = false
            this.confirmLoading = false
            this.getRolePage()
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
        await deleteRole(row.id)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getRolePage()
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
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
