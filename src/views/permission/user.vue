<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" type="primary" @click="handleAdd">创建用户</el-button>
      <div class="filter-item" style="float: right">
        <el-input v-model="listQuery.keyword" placeholder="请输入关键字" style="width: 200px;" class="filter-item" @keyup.enter.native="getUserPage" />
        <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-search" @click="getUserPage">查询</el-button>
      </div>
    </div>
    <el-table v-loading="listLoading" border :data="userList" style="width: 100%;" @sort-change="sortChange">
      <el-table-column align="center" label="id" prop="id" sortable width="60" />
      <el-table-column align="center" label="用户名" prop="username" sortable width="120" />
      <el-table-column align="center" label="姓名" prop="name" sortable width="120" />
      <el-table-column align="center" label="昵称" prop="nickName" sortable width="220" />
      <el-table-column align="center" label="性别" sortable width="80">
        <template slot-scope="scope">
          {{ scope.row.sex | sexFilter }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="生日" prop="birthday" sortable width="220">
        <template slot-scope="scope">
          {{ scope.row.birthday | formatDate }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" prop="introduction" label="简介" />
      <el-table-column align="center" label="操作" width="150">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getUserPage" />

    <el-dialog :visible.sync="dialogVisible" :destroy-on-close="true" :title="dialogType==='new'?'创建用户':'编辑用户'" top="8vh">
      <el-form ref="userForm" v-loading="formLoading" :model="user" label-width="80px" label-position="left" :rules="rules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model.trim="user.username" :disabled="dialogType==='edit'" placeholder="用户名" autocomplete="new-password" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model.trim="user.password" :placeholder="dialogType==='new'?'密码':'不输入则不进行修改'" show-password autocomplete="new-password" />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="姓名">
              <el-input v-model="user.name" placeholder="姓名" style="padding-right: 15px" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="昵称">
              <el-input v-model="user.nickname" placeholder="昵称" style="padding-right: 15px" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="性别">
              <el-radio v-model="user.sex" :label="0">保密</el-radio>
              <el-radio v-model="user.sex" :label="1">男</el-radio>
              <el-radio v-model="user.sex" :label="2">女</el-radio>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生日期">
              <el-date-picker v-model="user.birthday" type="date" placeholder="选择出生日期" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phoneNumber">
              <el-input v-model="user.phoneNumber" placeholder="手机号码" style="padding-right: 15px" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="user.email" placeholder="邮箱" style="padding-right: 15px" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="地址">
              <el-cascader v-model="user.addressCode" size="large" :options="areaOptions" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="详细地址">
              <el-input v-model="user.detailedAddress" placeholder="详细地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="用户简介">
          <el-input
            v-model="user.introduction"
            :autosize="{ minRows: 4, maxRows: 10 }"
            type="textarea"
            placeholder="用户简介"
          />
        </el-form-item>
        <el-form-item label="用户角色">
          <el-checkbox-group v-model="user.roleIds">
            <el-checkbox v-for="role in allRoles" :key="role.id" :label="role.id">{{ role.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否过期">
              <el-radio-group v-model="user.accountNonExpired">
                <el-radio :label="true">未过期</el-radio>
                <el-radio :label="false">已过期</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否锁定">
              <el-radio-group v-model="user.accountNonLocked">
                <el-radio :label="true">开启</el-radio>
                <el-radio :label="false">锁定</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="密码过期">
              <el-radio-group v-model="user.credentialsNonExpired">
                <el-radio :label="true">未过期</el-radio>
                <el-radio :label="false">已过期</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否禁用">
              <el-radio-group v-model="user.enabled">
                <el-radio :label="true">可用</el-radio>
                <el-radio :label="false">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button v-loading="confirmLoading" type="primary" @click="dialogType==='new'?createUser():updateUser()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { regionData } from 'element-china-area-data'
import { getUserPage, getUserById, addUser, updateUser, deleteUser } from '@/api/user'
import { checkUsername } from '@/api/register'
import { validUsername } from '@/utils/validate'
import { getAllRoleList } from '@/api/role'

const defaultUser = {
  id: '',
  username: '',
  password: '',
  accountNonExpired: true,
  accountNonLocked: true,
  credentialsNonExpired: true,
  enabled: true,
  name: '',
  nickname: '',
  sex: 0,
  birthday: '',
  avatar: '',
  email: '',
  phoneNumber: '',
  addressCode: '',
  detailedAddress: '',
  introduction: '',
  roleIds: []
}

export default {
  name: 'User',
  components: { Pagination },
  directives: { waves },
  filters: {
    sexFilter(value) {
      if (value) {
        if (value === 0) {
          return '男'
        } else {
          return '女'
        }
      } else {
        return '（未知）'
      }
    }
  },
  data() {
    const validateUsername = async(rule, value, callback) => {
      if (this.dialogType === 'new') {
        if (!validUsername(value)) {
          callback(new Error('用户名必须以字母开头，且与字母、数字、"."、"_"、和"@"构成'))
        } else if (value) {
          const { data } = await checkUsername(value)
          if (data !== true) {
            callback(new Error('该用户名已被注册'))
          }
        }
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (this.dialogType === 'new' && value.length < 6) {
        callback(new Error('密码不能少于6位数'))
      } else {
        callback()
      }
    }
    const validatePhoneNumber = (rule, value, callback) => {
      if (value) {
        if (!(/^1[3456789]\d{9}$/.test(value))) {
          callback(new Error('手机号码输入不正确'))
        }
      } else {
        callback()
      }
    }
    const validateEmail = (rule, value, callback) => {
      if (value) {
        if (!(/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/.test(value))) {
          callback(new Error('邮箱地址输入不正确'))
        }
      } else {
        callback()
      }
    }
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
      formLoading: false,
      user: Object.assign({}, defaultUser),
      allRoles: [],
      userList: [],
      areaOptions: regionData,
      selectedOptions: [],
      dialogVisible: false,
      dialogType: 'new',
      rules: {
        username: [
          { required: true, message: '用户名不能为空', trigger: 'blur' },
          { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' },
          { required: true, trigger: 'blur', validator: validateUsername }
        ],
        password: [
          { required: true, trigger: 'blur', validator: validatePassword }
        ],
        phoneNumber: [
          { trigger: 'blur', validator: validatePhoneNumber }
        ],
        email: [
          { trigger: 'blur', validator: validateEmail }
        ]
      }
    }
  },
  created() {
    this.getUserPage()
  },
  methods: {
    async getUserPage() {
      this.listLoading = true
      const res = await getUserPage(this.listQuery).catch(() => {
        this.listLoading = false
      })
      this.userList = res.data.records
      this.total = res.data.total
      this.listLoading = false
    },
    async getAllRole() {
      const res = await getAllRoleList()
      this.allRoles = res.data
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
      this.getUserPage()
    },
    async handleAdd() {
      this.dialogType = 'new'
      this.user = Object.assign({}, defaultUser)
      await this.getAllRole()
      this.confirmLoading = false
      this.dialogVisible = true
    },
    async handleEdit(scope) {
      this.dialogType = 'edit'
      const { data } = await getUserById(scope.row.id)
      if (!data.roleIds) {
        data.roleIds = []
      }
      this.user = data
      await this.getAllRole()
      this.confirmLoading = false
      this.dialogVisible = true
    },
    createUser() {
      this.$refs.userForm.validate(async valid => {
        if (valid) {
          this.confirmLoading = true
          await addUser(this.user).then(() => {
            const { name, introduction } = this.user
            this.$notify({
              title: '添加成功',
              dangerouslyUseHTMLString: true,
              message: `
              <div>名称: ${name}</div>
              <div>个人简介：${introduction}</div>
            `,
              type: 'success'
            })
            this.dialogVisible = false
            this.confirmLoading = false
            this.getUserPage()
          }).catch(() => {
            this.confirmLoading = false
          })
        }
      })
    },
    updateUser() {
      this.$refs.userForm.validate(async valid => {
        if (valid) {
          this.confirmLoading = true
          await updateUser(this.user).then(() => {
            const { name, introduction } = this.user
            this.$notify({
              title: '修改成功',
              dangerouslyUseHTMLString: true,
              message: `
              <div>名称: ${name}</div>
              <div>个人简介：${introduction}</div>
            `,
              type: 'success'
            })
            this.dialogVisible = false
            this.confirmLoading = false
            this.getUserPage()
          }).catch(() => {
            this.confirmLoading = false
          })
        }
      })
    },
    async handleDelete({ row }) {
      this.$confirm('确定删除这个资源?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await deleteUser(row.id)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getUserPage()
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
  .users-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
