package cloud.joysky.llmgateway.web.controller.system;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import cloud.joysky.llmgateway.common.core.controller.BaseController;
import cloud.joysky.llmgateway.common.core.domain.AjaxResult;
import cloud.joysky.llmgateway.common.core.domain.entity.SysUser;
import cloud.joysky.llmgateway.common.utils.StringUtils;
import cloud.joysky.llmgateway.framework.shiro.service.SysRegisterService;
import cloud.joysky.llmgateway.system.service.ISysConfigService;

/**
 * 注册验证
 * 
 * @author qvsu
 */
@Controller
public class SysRegisterController extends BaseController
{
    @Autowired
    private SysRegisterService registerService;

    @Autowired
    private ISysConfigService configService;

    @GetMapping("/register")
    public String register()
    {
        return "register";
    }

    @PostMapping("/register")
    @ResponseBody
    public AjaxResult ajaxRegister(SysUser user)
    {
        if (!("true".equals(configService.selectConfigByKey("sys.account.registerUser"))))
        {
            return error("当前系统没有开启注册功能！");
        }
        String msg = registerService.register(user);
        return StringUtils.isEmpty(msg) ? success() : error(msg);
    }
}
