package cloud.joysky.llmgateway.web.controller.system;

import java.awt.image.BufferedImage;
import java.io.IOException;
import javax.annotation.Resource;
import javax.imageio.ImageIO;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;
import com.google.code.kaptcha.Constants;
import com.google.code.kaptcha.Producer;
import cloud.joysky.llmgateway.common.core.domain.AjaxResult;
import cloud.joysky.llmgateway.common.core.controller.BaseController;
import cloud.joysky.llmgateway.common.utils.ShiroUtils;

/**
 * 图片验证码（支持算术形式）
 * 
 * @author qvsu
 */
@Controller
@RequestMapping("/captcha")
public class SysCaptchaController extends BaseController
{
    @Value("${qvsu.testing.exposeCaptchaCode:false}")
    private boolean exposeCaptchaCode;

    @Resource(name = "captchaProducer")
    private Producer captchaProducer;

    @Resource(name = "captchaProducerMath")
    private Producer captchaProducerMath;

    /**
     * 验证码生成
     */
    @GetMapping(value = "/captchaImage")
    public ModelAndView getKaptchaImage(HttpServletRequest request, HttpServletResponse response)
    {
        ServletOutputStream out = null;
        try
        {
            HttpSession session = request.getSession();
            response.setDateHeader("Expires", 0);
            response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
            response.addHeader("Cache-Control", "post-check=0, pre-check=0");
            response.setHeader("Pragma", "no-cache");
            response.setContentType("image/jpeg");

            String type = request.getParameter("type");
            String capStr = null;
            String code = null;
            BufferedImage bi = null;
            if ("math".equals(type))
            {
                String capText = captchaProducerMath.createText();
                capStr = capText.substring(0, capText.lastIndexOf("@"));
                code = capText.substring(capText.lastIndexOf("@") + 1);
                bi = captchaProducerMath.createImage(capStr);
            }
            else if ("char".equals(type))
            {
                capStr = code = captchaProducer.createText();
                bi = captchaProducer.createImage(capStr);
            }
            session.setAttribute(Constants.KAPTCHA_SESSION_KEY, code);
            // Keep servlet session and shiro session in sync for captcha validation.
            try
            {
                ShiroUtils.getSession().setAttribute(Constants.KAPTCHA_SESSION_KEY, code);
            }
            catch (Exception ignored)
            {
                // No-op: keep original behavior even if shiro session is unavailable.
            }
            out = response.getOutputStream();
            ImageIO.write(bi, "jpg", out);
            out.flush();

        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
        finally
        {
            try
            {
                if (out != null)
                {
                    out.close();
                }
            }
            catch (IOException e)
            {
                e.printStackTrace();
            }
        }
        return null;
    }

    /**
     * For automated tests only. Disabled by default.
     */
    @GetMapping(value = "/captchaCode")
    @ResponseBody
    public AjaxResult captchaCode(HttpServletRequest request)
    {
        if (!exposeCaptchaCode)
        {
            return AjaxResult.error("forbidden");
        }
        HttpSession session = request.getSession(false);
        Object code = session == null ? null : session.getAttribute(Constants.KAPTCHA_SESSION_KEY);
        if (code == null)
        {
            try
            {
                code = ShiroUtils.getSession().getAttribute(Constants.KAPTCHA_SESSION_KEY);
            }
            catch (Exception ignored)
            {
                // Ignore and keep empty response.
            }
        }
        return AjaxResult.success(code == null ? "" : String.valueOf(code));
    }
}
